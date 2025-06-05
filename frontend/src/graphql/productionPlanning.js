import { gql } from '@apollo/client';

// Fragments
const PRODUCTION_PLAN_FIELDS = gql`
  fragment ProductionPlanFields on ProductionPlan {
    id
    name
    description
    startDate
    endDate
    status
    createdBy
    approvedBy
    createdAt
    updatedAt
  }
`;

const CAPACITY_PLAN_FIELDS = gql`
  fragment CapacityPlanFields on CapacityPlan {
    id
    planId
    machineType
    dailyCapacity
    totalCapacity
    startDate
    endDate
    notes
  }
`;

const MATERIAL_PLAN_FIELDS = gql`
  fragment MaterialPlanFields on MaterialPlan {
    id
    planId
    materialId
    materialName
    quantityRequired
    estimatedCost
    deliveryDate
    notes
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