/**
 * GraphQL Schema untuk Machine Queue Service
 */
const { buildSchema } = require("graphql");
const { Machine, MachineQueue, sequelize } = require("../models");
const { Op } = require("sequelize");
const axios = require("axios");
const amqp = require("amqplib");

require("dotenv").config();

// Konfigurasi RabbitMQ
const rabbitMqUrl = process.env.RABBITMQ_URL || "amqp://localhost";
const queueName = process.env.QUEUE_NAME || "machine_queue_updates";

// Definisi schema GraphQL
const schema = buildSchema(`
  """
  Tipe data untuk representasi waktu
  """
  scalar Date

  """
  Status mesin
  """
  enum MachineStatus {
    operational
    maintenance
    breakdown
    inactive
  }

  """
  Status antrian
  """
  enum QueueStatus {
    waiting
    in_progress
    completed
    paused
    cancelled
  }

  """
  Prioritas antrian
  """
  enum QueuePriority {
    low
    normal
    high
    urgent
  }

  """
  Tipe data Mesin
  """
  type Machine {
    id: ID!
    machineId: String!
    name: String!
    type: String!
    manufacturer: String
    modelNumber: String
    capacity: Float
    capacityUnit: String
    location: String
    installationDate: Date
    lastMaintenance: Date
    nextMaintenance: Date
    status: MachineStatus!
    hoursPerDay: Float!
    notes: String
    createdAt: Date!
    updatedAt: Date!
    queues: [MachineQueue]
  }

  """
  Tipe data Antrian Mesin
  """
  type MachineQueue {
    id: ID!
    queueId: String!
    machineId: ID!
    batchId: ID!
    batchNumber: String!
    productName: String!
    stepId: ID
    stepName: String
    scheduledStartTime: Date
    scheduledEndTime: Date
    actualStartTime: Date
    actualEndTime: Date
    hoursRequired: Float!
    priority: QueuePriority!
    status: QueueStatus!
    operatorId: String
    operatorName: String
    setupTime: Float
    position: Int!
    notes: String
    createdAt: Date!
    updatedAt: Date!
    machine: Machine
  }

  """
  Filter untuk memperoleh mesin
  """
  input MachineFilter {
    type: String
    status: MachineStatus
  }

  """
  Filter untuk memperoleh antrian
  """
  input QueueFilter {
    machineId: ID
    batchId: ID
    status: QueueStatus
    priority: QueuePriority
  }

  """
  Input untuk membuat mesin baru
  """
  input CreateMachineInput {
    name: String!
    type: String!
    manufacturer: String
    modelNumber: String
    capacity: Float
    capacityUnit: String
    location: String
    installationDate: String
    hoursPerDay: Float
    notes: String
  }

  """
  Input untuk membuat antrian baru
  """
  input CreateQueueInput {
    machineId: ID!
    batchId: ID!
    batchNumber: String!
    productName: String!
    stepId: ID
    stepName: String
    scheduledStartTime: String
    scheduledEndTime: String
    hoursRequired: Float!
    priority: QueuePriority
    operatorId: String
    operatorName: String
    setupTime: Float
    notes: String
  }

  """
  Input untuk memperbarui mesin
  """
  input UpdateMachineInput {
    name: String
    type: String
    manufacturer: String
    modelNumber: String
    capacity: Float
    capacityUnit: String
    location: String
    installationDate: String
    lastMaintenance: String
    nextMaintenance: String
    status: MachineStatus
    hoursPerDay: Float
    notes: String
  }

  """
  Input untuk memperbarui antrian
  """
  input UpdateQueueInput {
    machineId: ID
    scheduledStartTime: String
    scheduledEndTime: String
    actualStartTime: String
    actualEndTime: String
    hoursRequired: Float
    priority: QueuePriority
    status: QueueStatus
    operatorId: String
    operatorName: String
    setupTime: Float
    position: Int
    notes: String
  }

  """
  Tipe respons kapasitas
  """
  type CapacityResponse {
    available: Boolean!
    message: String!
    machines: [Machine]
  }

  """
  Tipe Query
  """
  type Query {
    """
    Mendapatkan semua mesin
    """
    machines(filter: MachineFilter): [Machine]
    
    """
    Mendapatkan mesin berdasarkan ID
    """
    machine(id: ID!): Machine
    
    """
    Mendapatkan semua tipe mesin
    """
    machineTypes: [String]
    
    """
    Mendapatkan semua antrian
    """
    queues(filter: QueueFilter): [MachineQueue]
    
    """
    Mendapatkan antrian berdasarkan ID
    """
    queue(id: ID!): MachineQueue
    
    """
    Mendapatkan antrian untuk mesin tertentu
    """
    machineQueues(machineId: ID!): [MachineQueue]
    
    """
    Mendapatkan antrian untuk batch tertentu
    """
    batchQueues(batchId: ID!): [MachineQueue]
    
    """
    Memeriksa kapasitas mesin untuk waktu tertentu
    """
    checkCapacity(machineType: String!, hoursRequired: Float!, startDate: String, endDate: String): CapacityResponse
  }

  """
  Tipe Mutation
  """
  type Mutation {
    """
    Membuat mesin baru
    """
    createMachine(input: CreateMachineInput!): Machine
    
    """
    Memperbarui mesin
    """
    updateMachine(id: ID!, input: UpdateMachineInput!): Machine
    
    """
    Menghapus mesin
    """
    deleteMachine(id: ID!): Boolean
    
    """
    Membuat antrian baru
    """
    createQueue(input: CreateQueueInput!): MachineQueue
    
    """
    Memperbarui antrian
    """
    updateQueue(id: ID!, input: UpdateQueueInput!): MachineQueue
    
    """
    Menghapus antrian
    """
    deleteQueue(id: ID!): Boolean
    
    """
    Mengubah prioritas antrian
    """
    changeQueuePriority(id: ID!, priority: QueuePriority!): MachineQueue
    
    """
    Mengubah urutan antrian
    """
    reorderQueue(id: ID!, newPosition: Int!): MachineQueue
    
    """
    Memulai pekerjaan antrian
    """
    startQueue(id: ID!, operatorId: String, operatorName: String): MachineQueue
    
    """
    Menyelesaikan pekerjaan antrian
    """
    completeQueue(id: ID!, notes: String): MachineQueue
  }
`);

// Root resolver
const root = {
  // Format tanggal
  Date: {
    serialize: (date) => (date instanceof Date ? date.toISOString() : null),
    parseValue: (value) => (value ? new Date(value) : null),
    parseLiteral: (ast) => (ast.value ? new Date(ast.value) : null),
  },

  // Query Resolvers
  machines: async ({ filter }) => {
    try {
      const where = {};

      if (filter) {
        if (filter.type) where.type = filter.type;
        if (filter.status) where.status = filter.status;
      }

      const machines = await Machine.findAll({
        where,
        order: [["name", "ASC"]],
        include: [
          {
            model: MachineQueue,
            as: "queues",
            where: {
              status: {
                [Op.ne]: "completed",
              },
            },
            required: false,
          },
        ],
      });

      return machines;
    } catch (error) {
      console.error("GraphQL error - machines query:", error);
      throw new Error("Gagal mengambil data mesin");
    }
  },

  machine: async ({ id }) => {
    try {
      const machine = await Machine.findByPk(id, {
        include: [
          {
            model: MachineQueue,
            as: "queues",
            where: {
              status: {
                [Op.ne]: "completed",
              },
            },
            required: false,
          },
        ],
      });
      if (!machine) {
        throw new Error("Mesin tidak ditemukan");
      }
      return machine;
    } catch (error) {
      console.error("Error mengambil mesin berdasarkan ID:", error);
      throw new Error("Gagal mengambil mesin");
    }
  },

  machineTypes: async () => {
    try {
      const types = await Machine.findAll({
        attributes: [[sequelize.fn("DISTINCT", sequelize.col("type")), "type"]],
        raw: true,
      });
      return types.map((item) => item.type);
    } catch (error) {
      console.error("Error mengambil tipe mesin:", error);
      throw new Error("Gagal mengambil tipe mesin");
    }
  },

  queues: async ({ filter }) => {
    try {
      const where = {};
      if (filter && filter.machineId) {
        where.machineId = filter.machineId;
      }

      const queues = await MachineQueue.findAll({
        where,
        include: [
          {
            model: Machine,
            as: "machine",
          },
        ],
        order: [
          ["status", "ASC"],
          ["priority", "DESC"],
          ["scheduledStartTime", "ASC"],
        ],
      });

      return queues;
    } catch (error) {
      console.error("GraphQL error - queues query:", error);
      throw new Error("Gagal mengambil data antrian");
    }
  },

  queue: async ({ id }) => {
    try {
      const queue = await MachineQueue.findByPk(id, {
        include: [
          {
            model: Machine,
            as: "machine",
          },
        ],
      });

      if (!queue) {
        throw new Error("Antrian tidak ditemukan");
      }

      return queue;
    } catch (error) {
      console.error("GraphQL error - queue query:", error);
      throw new Error(error.message);
    }
  },

  machineQueues: async ({ machineId }) => {
    try {
      const machine = await Machine.findByPk(machineId);
      if (!machine) {
        throw new Error("Mesin tidak ditemukan");
      }

      const queues = await MachineQueue.findAll({
        where: { machineId },
        order: [
          ["status", "ASC"],
          ["position", "ASC"],
          ["priority", "DESC"],
          ["scheduledStartTime", "ASC"],
        ],
        include: [
          {
            model: Machine,
            as: "machine",
          },
        ],
      });

      return queues;
    } catch (error) {
      console.error("GraphQL error - machineQueues query:", error);
      throw new Error(error.message);
    }
  },

  batchQueues: async ({ batchId }) => {
    try {
      const queues = await MachineQueue.findAll({
        where: { batchId },
        include: [
          {
            model: Machine,
            as: "machine",
          },
        ],
        order: [
          ["status", "ASC"],
          ["scheduledStartTime", "ASC"],
        ],
      });

      return queues;
    } catch (error) {
      console.error("GraphQL error - batchQueues query:", error);
      throw new Error("Gagal mengambil antrian untuk batch");
    }
  },

  checkCapacity: async ({ machineType, hoursRequired, startDate, endDate }) => {
    try {
      if (!machineType || !hoursRequired) {
        throw new Error("Tipe mesin dan jam yang dibutuhkan diperlukan");
      }

      // Dapatkan semua mesin dengan tipe yang diminta dan status operational
      const machines = await Machine.findAll({
        where: {
          type: machineType,
          status: "operational",
        },
      });

      if (machines.length === 0) {
        return {
          available: false,
          message: `Tidak ada mesin ${machineType} yang tersedia`,
          machines: [],
        };
      }

      // Untuk setiap mesin, periksa ketersediaan pada rentang waktu yang diminta
      const availableMachines = [];

      const requestedStart = startDate ? new Date(startDate) : new Date();
      const requestedEnd = endDate
        ? new Date(endDate)
        : new Date(requestedStart.getTime() + hoursRequired * 60 * 60 * 1000);

      for (const machine of machines) {
        // Dapatkan semua antrian yang tumpang tindih dengan rentang waktu yang diminta
        const overlappingQueues = await MachineQueue.findAll({
          where: {
            machineId: machine.id,
            status: {
              [Op.in]: ["waiting", "in_progress"],
            },
            [Op.or]: [
              {
                scheduledStartTime: {
                  [Op.between]: [requestedStart, requestedEnd],
                },
              },
              {
                scheduledEndTime: {
                  [Op.between]: [requestedStart, requestedEnd],
                },
              },
              {
                [Op.and]: [
                  {
                    scheduledStartTime: {
                      [Op.lte]: requestedStart,
                    },
                  },
                  {
                    scheduledEndTime: {
                      [Op.gte]: requestedEnd,
                    },
                  },
                ],
              },
            ],
          },
        });

        if (overlappingQueues.length === 0) {
          // Mesin tersedia
          availableMachines.push(machine);
        }
      }

      // Jika ada mesin yang tersedia, kembalikan true
      if (availableMachines.length > 0) {
        return {
          available: true,
          message: `${availableMachines.length} mesin ${machineType} tersedia`,
          machines: availableMachines,
        };
      } else {
        // Tidak ada mesin yang tersedia pada rentang waktu yang diminta
        return {
          available: false,
          message: `Semua mesin ${machineType} sudah dijadwalkan pada rentang waktu yang diminta`,
          machines: [],
        };
      }
    } catch (error) {
      console.error("GraphQL error - checkCapacity query:", error);
      throw new Error("Gagal memeriksa kapasitas: " + error.message);
    }
  },

  // Mutation Resolvers
  createMachine: async ({ input }) => {
    try {
      const {
        name,
        type,
        manufacturer,
        modelNumber,
        capacity,
        capacityUnit,
        location,
        installationDate,
        hoursPerDay,
        notes,
      } = input;

      // Validasi data masukan
      if (!name || !type) {
        throw new Error("Nama dan tipe mesin diperlukan");
      }

      // Buat ID mesin unik
      const machineId = `MACHINE-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      // Buat mesin baru
      const newMachine = await Machine.create({
        machineId,
        name,
        type,
        manufacturer,
        modelNumber,
        capacity,
        capacityUnit,
        location,
        installationDate: installationDate ? new Date(installationDate) : null,
        hoursPerDay: hoursPerDay || 8.0,
        status: "operational",
        notes,
      });

      return newMachine;
    } catch (error) {
      console.error("GraphQL error - createMachine mutation:", error);
      throw new Error("Gagal membuat mesin: " + error.message);
    }
  },

  updateMachine: async ({ id, input }) => {
    try {
      const machine = await Machine.findByPk(id);
      if (!machine) {
        throw new Error("Mesin tidak ditemukan");
      }
      await machine.update(input);
      return machine;
    } catch (error) {
      console.error("GraphQL error - updateMachine mutation:", error);
      throw new Error("Gagal memperbarui mesin: " + error.message);
    }
  },

  deleteMachine: async ({ id }) => {
    try {
      const deleted = await Machine.destroy({ where: { id } });
      if (deleted === 0) {
        throw new Error("Mesin tidak ditemukan");
      }
      return true;
    } catch (error) {
      console.error("GraphQL error - deleteMachine mutation:", error);
      throw new Error("Gagal menghapus mesin: " + error.message);
    }
  },

  createQueue: async ({ input }) => {
    try {
      const {
        machineId,
        batchId,
        batchNumber,
        productName,
        stepId,
        stepName,
        scheduledStartTime,
        scheduledEndTime,
        hoursRequired,
        priority,
        operatorId,
        operatorName,
        setupTime,
        notes,
      } = input;

      const lastPosition = await MachineQueue.max("position", {
        where: { machineId },
      });
      const newPosition = (lastPosition || 0) + 1;

      const newQueue = await MachineQueue.create({
        queueId: `QUEUE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        machineId,
        batchId,
        batchNumber,
        productName,
        stepId,
        stepName,
        scheduledStartTime: scheduledStartTime
          ? new Date(scheduledStartTime)
          : null,
        scheduledEndTime: scheduledEndTime ? new Date(scheduledEndTime) : null,
        hoursRequired,
        priority: priority || "normal",
        status: "waiting",
        operatorId,
        operatorName,
        setupTime: setupTime || 0,
        position: newPosition,
        notes,
      });

      return newQueue;
    } catch (error) {
      console.error("GraphQL error - createQueue mutation:", error);
      throw new Error("Gagal membuat antrian: " + error.message);
    }
  },

  updateQueue: async ({ id, input }) => {
    try {
      const queue = await MachineQueue.findByPk(id);
      if (!queue) {
        throw new Error("Antrian tidak ditemukan");
      }
      await queue.update(input);
      return queue;
    } catch (error) {
      console.error("GraphQL error - updateQueue mutation:", error);
      throw new Error("Gagal memperbarui antrian: " + error.message);
    }
  },

  deleteQueue: async ({ id }) => {
    try {
      const deleted = await MachineQueue.destroy({ where: { id } });
      if (deleted === 0) {
        throw new Error("Antrian tidak ditemukan");
      }
      return true;
    } catch (error) {
      console.error("GraphQL error - deleteQueue mutation:", error);
      throw new Error("Gagal menghapus antrian: " + error.message);
    }
  },

  changeQueuePriority: async ({ id, priority }) => {
    try {
      const queue = await MachineQueue.findByPk(id);
      if (!queue) {
        throw new Error("Antrian tidak ditemukan");
      }
      await queue.update({ priority });
      return queue;
    } catch (error) {
      console.error("GraphQL error - changeQueuePriority mutation:", error);
      throw new Error("Gagal mengubah prioritas antrian: " + error.message);
    }
  },

  reorderQueue: async ({ id, newPosition }) => {
    try {
      const queueToReorder = await MachineQueue.findByPk(id);
      if (!queueToReorder) {
        throw new Error("Antrian tidak ditemukan");
      }

      const oldPosition = queueToReorder.position;

      if (newPosition < 1) {
        throw new Error("Posisi baru harus lebih besar dari 0");
      }

      await sequelize.transaction(async (t) => {
        if (newPosition > oldPosition) {
          // Pindahkan ke bawah: kurangi posisi antrian di antara oldPosition dan newPosition
          await MachineQueue.decrement("position", {
            by: 1,
            where: {
              machineId: queueToReorder.machineId,
              position: { [Op.gt]: oldPosition, [Op.lte]: newPosition },
            },
            transaction: t,
          });
        } else if (newPosition < oldPosition) {
          // Pindahkan ke atas: tambah posisi antrian di antara newPosition dan oldPosition
          await MachineQueue.increment("position", {
            by: 1,
            where: {
              machineId: queueToReorder.machineId,
              position: { [Op.gte]: newPosition, [Op.lt]: oldPosition },
            },
            transaction: t,
          });
        }

        // Set posisi baru untuk antrian yang diurutkan ulang
        await queueToReorder.update(
          { position: newPosition },
          { transaction: t }
        );
      });

      return queueToReorder;
    } catch (error) {
      console.error("GraphQL error - reorderQueue mutation:", error);
      throw new Error("Gagal mengubah urutan antrian: " + error.message);
    }
  },

  startQueue: async ({ id, operatorId, operatorName }) => {
    try {
      const queue = await MachineQueue.findByPk(id);
      if (!queue) {
        throw new Error("Antrian tidak ditemukan");
      }
      if (queue.status !== "waiting") {
        throw new Error("Antrian hanya bisa dimulai jika berstatus 'waiting'");
      }

      await queue.update({
        status: "in_progress",
        actualStartTime: new Date(),
        operatorId: operatorId || queue.operatorId,
        operatorName: operatorName || queue.operatorName,
      });

      // Publikasikan pesan ke RabbitMQ
      const connection = await amqp.connect(rabbitMqUrl);
      const channel = await connection.createChannel();
      await channel.assertQueue(queueName, { durable: true });

      const message = JSON.stringify({
        queueId: queue.queueId,
        batchId: queue.batchId,
        productName: queue.productName,
        status: "in_progress",
        actualStartTime: queue.actualStartTime,
        plannedQuantity: queue.hoursRequired, // Menambahkan plannedQuantity
      });

      channel.sendToQueue(queueName, Buffer.from(message), {
        persistent: true,
      });
      console.log(
        `Pesan 'in_progress' dikirim ke RabbitMQ untuk queueId: ${queue.queueId}`
      );

      await channel.close();
      await connection.close();

      return queue;
    } catch (error) {
      console.error("GraphQL error - startQueue mutation:", error);
      throw new Error("Gagal memulai pekerjaan antrian: " + error.message);
    }
  },

  completeQueue: async ({ id, notes }) => {
    try {
      const queue = await MachineQueue.findByPk(id);
      if (!queue) {
        throw new Error("Antrian tidak ditemukan");
      }
      if (queue.status !== "in_progress") {
        throw new Error(
          "Antrian hanya bisa diselesaikan jika berstatus 'in_progress'"
        );
      }

      await queue.update({
        status: "completed",
        actualEndTime: new Date(),
        notes: notes || queue.notes,
        completedQuantity: queue.hoursRequired, // Menambahkan completedQuantity
      });

      // Publikasikan pesan ke RabbitMQ
      const connection = await amqp.connect(rabbitMqUrl);
      const channel = await connection.createChannel();
      await channel.assertQueue(queueName, { durable: true });

      const message = JSON.stringify({
        queueId: queue.queueId,
        batchId: queue.batchId,
        productName: queue.productName,
        status: "completed",
        actualEndTime: queue.actualEndTime,
        completedQuantity: queue.hoursRequired, // Menggunakan hoursRequired sebagai contoh completedQuantity
      });

      channel.sendToQueue(queueName, Buffer.from(message), {
        persistent: true,
      });
      console.log(
        `Pesan 'completed' dikirim ke RabbitMQ untuk queueId: ${queue.queueId}`
      );

      await channel.close();
      await connection.close();

      return queue;
    } catch (error) {
      console.error("GraphQL error - completeQueue mutation:", error);
      throw new Error(
        "Gagal menyelesaikan pekerjaan antrian: " + error.message
      );
    }
  },
};

module.exports = {
  schema,
  root,
};
