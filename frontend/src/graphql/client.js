import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  split,
  ApolloLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { getMainDefinition } from "@apollo/client/utilities";
import { toast } from "react-toastify";

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      toast.error(`GraphQL Error: ${message}`);
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    toast.error(`Network Error: ${networkError.message}`);
  }
});

// Service endpoints
const endpoints = {
  userService: "http://localhost:5006/graphql",
  productionManagement: "http://localhost:5001/graphql",
  productionPlanning: "http://localhost:5300/graphql",
  machineQueue: "http://localhost:5003/graphql",
  materialInventory: "http://localhost:5004/graphql",
  productionFeedback: "http://localhost:5005/graphql",
};

// Create HTTP links for each service
const userServiceLink = new HttpLink({
  uri: endpoints.userService,
  credentials: "include",
});

const productionManagementLink = new HttpLink({
  uri: endpoints.productionManagement,
});

const productionPlanningLink = new HttpLink({
  uri: endpoints.productionPlanning,
});

const machineQueueLink = new HttpLink({
  uri: endpoints.machineQueue,
});

const materialInventoryLink = new HttpLink({
  uri: endpoints.materialInventory,
});

const productionFeedbackLink = new HttpLink({
  uri: endpoints.productionFeedback,
});

// Request middleware to add auth token to requests
const authMiddleware = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem("token");
  if (token) {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        authorization: `Bearer ${token}`,
      },
    }));
  }
  return forward(operation);
});

// Create split link based on operation type
const serviceLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    if (definition.kind !== "OperationDefinition") return false;

    // Route to appropriate service based on operation name or specific operations
    const operationName = definition.name?.value || "";

    console.log("GraphQL Operation Name:", operationName);

    const isUserServiceOperation = [
      "Login",
      "Register",
      "VerifyToken",
      "ChangePassword",
      "RequestPasswordReset",
      "ResetPassword",
      "GetUsers",
      "GetUser",
      "GetCurrentUser",
      "GetUsersSummary",
      "CreateUser",
      "UpdateUser",
      "UpdateUserStatus",
    ].includes(operationName);

    if (isUserServiceOperation) {
      console.log("Routing to User Service Link");
      return true;
    }
    console.log("Not routing to User Service Link");
    return false;
  },
  userServiceLink,
  split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      if (definition.kind !== "OperationDefinition") return false;
      const operationName = definition.name?.value || "";
      console.log(
        "GraphQL Operation Name (ProductionManagement check):",
        operationName
      );
      if (operationName.startsWith("ProductionManagement")) {
        console.log("Routing to Production Management Link");
        return true;
      }
      console.log("Not routing to Production Management Link");
      return false;
    },
    productionManagementLink,
    split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        if (definition.kind !== "OperationDefinition") return false;
        const operationName = definition.name?.value || "";
        console.log(
          "GraphQL Operation Name (ProductionPlanning check):",
          operationName
        );
        const isProductionPlanningOperation = [
          "GetPlans",
          "GetPlan",
          "GetCapacityPlans",
          "GetMaterialPlans",
          "GetCapacityPlan",
          "GetMaterialPlan",
          "GetPlansSummary",
          "CreatePlan",
          "UpdatePlan",
          "DeletePlan",
          "ApprovePlan",
          "AddCapacityPlan",
          "AddMaterialPlan",
          "UpdateCapacityPlan",
          "DeleteCapacityPlan",
          "UpdateMaterialPlan",
        ].includes(operationName);

        if (isProductionPlanningOperation) {
          console.log("Routing to Production Planning Link");
          return true;
        }
        console.log("Not routing to Production Planning Link");
        return false;
      },
      productionPlanningLink,
      split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          if (definition.kind !== "OperationDefinition") return false;
          const operationName = definition.name?.value || "";
          console.log(
            "GraphQL Operation Name (MachineQueue check):",
            operationName
          );
          if (operationName.startsWith("MachineQueue")) {
            console.log("Routing to Machine Queue Link");
            return true;
          }
          console.log("Not routing to Machine Queue Link");
          return false;
        },
        machineQueueLink,
        split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            if (definition.kind !== "OperationDefinition") return false;
            const operationName = definition.name?.value || "";
            console.log(
              "GraphQL Operation Name (MaterialInventory check):",
              operationName
            );
            if (operationName.startsWith("MaterialInventory")) {
              console.log("Routing to Material Inventory Link");
              return true;
            }
            console.log("Not routing to Material Inventory Link");
            return false;
          },
          materialInventoryLink,
          productionFeedbackLink
        )
      )
    )
  )
);

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, authMiddleware, serviceLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});
