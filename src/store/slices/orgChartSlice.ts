import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { orgChartService } from "../../services/orgChart.service";

/**
 * Tree node structure from API response
 */
export interface TreeNode {
  employee_id?: number;
  id?: number;
  target: string; // Employee name
  pic?: string; // Profile picture URL
  direct_reports?: number;
  indirect_reports?: number;
  relationship_id?: string;
  effective_start_date?: string;
  effective_end_date?: string;
  children?: TreeNode[];
  [key: string]: any;
}

/**
 * API Response structure
 */
export interface OrgChartApiResponse {
  status: string;
  tree: TreeNode;
}

/**
 * Transformed employee data for UI
 */
export interface EmployeeData {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  profilePic?: string;
  position?: string;
  department?: string;
  email?: string;
  phone?: string;
  directReports?: number;
  indirectReports?: number;
  relationshipId?: string;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
  children?: EmployeeData[];
  [key: string]: any;
}

/**
 * Org Chart State
 */
interface OrgChartState {
  // API states
  loading: boolean;
  success: boolean;
  error: string | null;

  // Data
  orgChartData: OrgChartApiResponse | null;
  treeData: TreeNode | null;

  // UI states
  selectedEmployee: EmployeeData | null;
  sidebarEmployee: EmployeeData | null;
  isSidebarOpen: boolean;

  // Search
  searchQuery: string;
  searchResults: EmployeeData[];
}

const initialState: OrgChartState = {
  loading: false,
  success: false,
  error: null,
  orgChartData: null,
  treeData: null,
  selectedEmployee: null,
  sidebarEmployee: null,
  isSidebarOpen: false,
  searchQuery: "",
  searchResults: [],
};

/**
 * Transform tree node to employee data
 */
function transformTreeNodeToEmployee(node: TreeNode): EmployeeData {
  const nameParts = node.target?.trim().split(" ") || [];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    id: node.employee_id || node.id || 0,
    name: node.target || "",
    firstName,
    lastName,
    profilePic: node.pic,
    directReports: node.direct_reports,
    indirectReports: node.indirect_reports,
    relationshipId: node.relationship_id,
    effectiveStartDate: node.effective_start_date,
    effectiveEndDate: node.effective_end_date,
    children: node.children?.map(transformTreeNodeToEmployee),
  };
}

/**
 * Flatten tree structure for search
 */
function flattenTree(
  node: TreeNode,
  result: EmployeeData[] = []
): EmployeeData[] {
  const employee = transformTreeNodeToEmployee(node);
  result.push(employee);

  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      flattenTree(child, result);
    });
  }

  return result;
}

/**
 * Async thunk to fetch org chart data
 */
export const fetchOrgChart = createAsyncThunk(
  "orgChart/fetchOrgChart",
  async (employeeId: number, { rejectWithValue }) => {
    try {
      const response = await orgChartService.getPeopleChart(employeeId);

      // The API returns a tree structure, so we need to handle it
      // If response has tree property, use it directly
      const responseAny = response as any;
      if (responseAny.tree) {
        return responseAny as OrgChartApiResponse;
      }

      // Otherwise, wrap it in the expected format
      // The service might return the tree directly or wrapped
      return {
        status: "OK",
        tree: responseAny.tree || responseAny,
      } as OrgChartApiResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch organizational chart"
      );
    }
  }
);

/**
 * Org Chart Slice
 */
const orgChartSlice = createSlice({
  name: "orgChart",
  initialState,
  reducers: {
    // Set selected employee (for highlighting in chart)
    setSelectedEmployee: (
      state,
      action: PayloadAction<EmployeeData | null>
    ) => {
      state.selectedEmployee = action.payload;
    },

    // Set sidebar employee (for displaying details)
    setSidebarEmployee: (state, action: PayloadAction<EmployeeData | null>) => {
      state.sidebarEmployee = action.payload;
      state.isSidebarOpen = action.payload !== null;
    },

    // Toggle sidebar
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
      if (!state.isSidebarOpen) {
        state.sidebarEmployee = null;
      }
    },

    // Close sidebar
    closeSidebar: (state) => {
      state.isSidebarOpen = false;
      state.sidebarEmployee = null;
    },

    // Set search query
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;

      // Perform search if we have tree data
      if (state.treeData && action.payload.trim()) {
        const allEmployees = flattenTree(state.treeData);
        const query = action.payload.toLowerCase().trim();
        state.searchResults = allEmployees.filter(
          (emp) =>
            emp.name.toLowerCase().includes(query) ||
            emp.firstName?.toLowerCase().includes(query) ||
            emp.lastName?.toLowerCase().includes(query)
        );
      } else {
        state.searchResults = [];
      }
    },

    // Clear search
    clearSearch: (state) => {
      state.searchQuery = "";
      state.searchResults = [];
    },

    // Reset state
    resetOrgChart: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.orgChartData = null;
      state.treeData = null;
      state.selectedEmployee = null;
      state.sidebarEmployee = null;
      state.isSidebarOpen = false;
      state.searchQuery = "";
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch org chart - pending
      .addCase(fetchOrgChart.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      // Fetch org chart - fulfilled
      .addCase(
        fetchOrgChart.fulfilled,
        (state, action: PayloadAction<OrgChartApiResponse>) => {
          state.loading = false;
          state.success = true;
          state.error = null;
          state.orgChartData = action.payload;
          state.treeData = action.payload.tree;

          // Transform root employee and set as selected by default
          if (action.payload.tree) {
            state.selectedEmployee = transformTreeNodeToEmployee(
              action.payload.tree
            );
          }
        }
      )
      // Fetch org chart - rejected
      .addCase(fetchOrgChart.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          (action.payload as string) || "Failed to fetch organizational chart";
        state.orgChartData = null;
        state.treeData = null;
      });
  },
});

export const {
  setSelectedEmployee,
  setSidebarEmployee,
  toggleSidebar,
  closeSidebar,
  setSearchQuery,
  clearSearch,
  resetOrgChart,
} = orgChartSlice.actions;

export default orgChartSlice.reducer;
