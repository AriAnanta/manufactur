import { gql } from "@apollo/client";

// Fragments
const PRODUCTION_PLAN_FIELDS = gql`
  fragment ProductionPlanFields on ProductionPlan {
    id
    planId
    requestId
    productionRequestId
    productName
    plannedStartDate
    plannedEndDate
    priority
    status
    approvedBy
    approvalDate
    plannedBatches
    planningNotes
    totalCapacityRequired
    totalMaterialCost
    createdAt
    updatedAt
  }
`;

const CAPACITY_PLAN_FIELDS = gql`
  fragment CapacityPlanFields on CapacityPlan {
    id
    planId
    machineType
    hoursRequired
    startDate
    endDate
    notes
    status
    plannedMachineId
    createdAt
    updatedAt
  }
`;

const MATERIAL_PLAN_FIELDS = gql`
  fragment MaterialPlanFields on MaterialPlan {
    id
    planId
    materialId
    materialName
    quantityRequired
    unitOfMeasure
    unitCost
    totalCost
    status
    availabilityChecked
    availabilityDate
    notes
    createdAt
    updatedAt
  }
`;

// Queries
export const GET_PLANS = gql`
  query GetPlans {
    plans {
      ...ProductionPlanFields
    }
  }
  ${PRODUCTION_PLAN_FIELDS}
`;

export const GET_PLAN = gql`
  query GetPlan($id: ID!) {
    plan(id: $id) {
      ...ProductionPlanFields
      capacityPlans {
        ...CapacityPlanFields
      }
      materialPlans {
        ...MaterialPlanFields
      }
    }
  }
  ${PRODUCTION_PLAN_FIELDS}
  ${CAPACITY_PLAN_FIELDS}
  ${MATERIAL_PLAN_FIELDS}
`;

export const GET_CAPACITY_PLANS = gql`
  query GetCapacityPlans($planId: ID!) {
    capacityPlans(planId: $planId) {
      ...CapacityPlanFields
    }
  }
  ${CAPACITY_PLAN_FIELDS}
`;

export const GET_MATERIAL_PLANS = gql`
  query GetMaterialPlans($planId: ID!) {
    materialPlans(planId: $planId) {
      ...MaterialPlanFields
    }
  }
  ${MATERIAL_PLAN_FIELDS}
`;

export const GET_CAPACITY_PLAN = gql`
  query GetCapacityPlan($id: ID!) {
    capacityPlan(id: $id) {
      ...CapacityPlanFields
    }
  }
  ${CAPACITY_PLAN_FIELDS}
`;

export const GET_MATERIAL_PLAN = gql`
  query GetMaterialPlan($id: ID!) {
    materialPlan(id: $id) {
      ...MaterialPlanFields
    }
  }
  ${MATERIAL_PLAN_FIELDS}
`;

// Dashboard summary query
export const GET_PLANS_SUMMARY = gql`
  query GetPlansSummary {
    plansSummary {
      total
      status {
        status
        count
        color
      }
    }
  }
`;

// Mutations
export const CREATE_PLAN = gql`
  mutation CreatePlan($input: PlanInput!) {
    createPlan(input: $input) {
      ...ProductionPlanFields
    }
  }
  ${PRODUCTION_PLAN_FIELDS}
`;

export const UPDATE_PLAN = gql`
  mutation UpdatePlan($id: ID!, $input: PlanUpdateInput!) {
    updatePlan(id: $id, input: $input) {
      ...ProductionPlanFields
    }
  }
  ${PRODUCTION_PLAN_FIELDS}
`;

export const DELETE_PLAN = gql`
  mutation DeletePlan($id: ID!) {
    deletePlan(id: $id) {
      success
      message
    }
  }
`;

export const APPROVE_PLAN = gql`
  mutation ApprovePlan($id: ID!) {
    approvePlan(id: $id) {
      success
      message
      plan {
        ...ProductionPlanFields
      }
    }
  }
  ${PRODUCTION_PLAN_FIELDS}
`;

export const ADD_CAPACITY_PLAN = gql`
  mutation AddCapacityPlan($planId: ID!, $input: CapacityPlanInput!) {
    addCapacityPlan(planId: $planId, input: $input) {
      ...CapacityPlanFields
    }
  }
  ${CAPACITY_PLAN_FIELDS}
`;

export const ADD_MATERIAL_PLAN = gql`
  mutation AddMaterialPlan($planId: ID!, $input: MaterialPlanInput!) {
    addMaterialPlan(planId: $planId, input: $input) {
      ...MaterialPlanFields
    }
  }
  ${MATERIAL_PLAN_FIELDS}
`;

export const UPDATE_CAPACITY_PLAN = gql`
  mutation UpdateCapacityPlan($id: ID!, $input: CapacityPlanUpdateInput!) {
    updateCapacityPlan(id: $id, input: $input) {
      ...CapacityPlanFields
    }
  }
  ${CAPACITY_PLAN_FIELDS}
`;

export const DELETE_CAPACITY_PLAN = gql`
  mutation DeleteCapacityPlan($id: ID!) {
    deleteCapacityPlan(id: $id) {
      success
      message
    }
  }
`;

export const UPDATE_MATERIAL_PLAN = gql`
  mutation UpdateMaterialPlan($id: ID!, $input: MaterialPlanUpdateInput!) {
    updateMaterialPlan(id: $id, input: $input) {
      ...MaterialPlanFields
    }
  }
  ${MATERIAL_PLAN_FIELDS}
`;

export const DELETE_MATERIAL_PLAN = gql`
  mutation DeleteMaterialPlan($id: ID!) {
    deleteMaterialPlan(id: $id) {
      success
      message
    }
  }
`;
