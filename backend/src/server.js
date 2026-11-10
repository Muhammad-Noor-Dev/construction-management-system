require("dotenv").config();

const express = require("express");

const pool =
    require("./config/database");

const authRoutes =
    require("./routes/authRoutes");

const employeeRoutes =
    require("./routes/employeeRoutes");

const clientRoutes =
    require("./routes/clientRoutes");

const projectRoutes =
    require("./routes/projectRoutes");

const projectCostRoutes =
    require("./routes/projectCostRoutes");

const siteRoutes =
    require("./routes/siteRoutes");

const employeeSiteAssignmentRoutes =
    require("./routes/employeeSiteAssignmentRoutes");

const attendanceRoutes =
    require("./routes/attendanceRoutes");

const payrollPeriodRoutes =
    require("./routes/payrollPeriodRoutes");

const payrollRecordRoutes =
    require("./routes/payrollRecordRoutes");

const payrollDeductionRoutes =
    require("./routes/payrollDeductionRoutes");

const payslipRoutes =
    require("./routes/payslipRoutes");

const contractorRoutes =
    require("./routes/contractorRoutes");

const projectContractorRoutes =
    require("./routes/projectContractorRoutes");

const contractorRatingRoutes =
    require("./routes/contractorRatingRoutes");

const clientPaymentRoutes =
    require("./routes/clientPaymentRoutes");

const contractorPaymentRoutes =
    require("./routes/contractorPaymentRoutes");

const warehouseRoutes =
    require("./routes/warehouseRoutes");

const inventoryCategoryRoutes =
    require("./routes/inventoryCategoryRoutes");

const inventoryItemRoutes =
    require("./routes/inventoryItemRoutes");

const warehouseStockRoutes =
    require("./routes/warehouseStockRoutes");

const inventoryTransactionRoutes =
    require("./routes/inventoryTransactionRoutes");

const materialIssuanceRequestRoutes =
    require("./routes/materialIssuanceRequestRoutes");

const materialIssuanceItemRoutes =
    require("./routes/materialIssuanceItemRoutes");

const siteMaterialRecordRoutes =
    require("./routes/siteMaterialRecordRoutes");

const auditLogRoutes =
    require("./routes/auditLogRoutes");

const systemSettingsRoutes =
    require("./routes/systemSettingsRoutes");

const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const completionRoutes = require("./routes/completionRoutes");

const app = express();


const PORT =
    process.env.PORT || 5000;


// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Make the authenticated user available to PostgreSQL audit triggers.
const authenticate = require("./middleware/authMiddleware");
const contextMiddleware = require("./middleware/contextMiddleware");
const rbacMatrix = require("./middleware/rbacMatrix");
app.use("/api", (req,res,next)=>{
  if (req.path === "/auth/login") return next();
  authenticate(req,res,()=>contextMiddleware(req,res,()=>rbacMatrix(req,res,next)));
});


// Routes

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/employees",
    employeeRoutes
);

app.use(
    "/api/clients",
    clientRoutes
);

app.use(
    "/api/projects",
    projectRoutes
);

app.use(
    "/api/project-costs",
    projectCostRoutes
);

app.use(
    "/api/sites",
    siteRoutes
);

app.use(
    "/api/employee-site-assignments",
    employeeSiteAssignmentRoutes
);

app.use(
    "/api/attendance",
    attendanceRoutes
);

app.use(
    "/api/payroll-periods",
    payrollPeriodRoutes
);

app.use(
    "/api/payroll-records",
    payrollRecordRoutes
);

app.use(
    "/api/payroll-deductions",
    payrollDeductionRoutes
);

app.use(
    "/api/payslips",
    payslipRoutes
);

app.use(
    "/api/contractors",
    contractorRoutes
);

app.use(
    "/api/project-contractors",
    projectContractorRoutes
);

app.use(
    "/api/contractor-ratings",
    contractorRatingRoutes
);

app.use(
    "/api/client-payments",
    clientPaymentRoutes
);

app.use(
    "/api/contractor-payments",
    contractorPaymentRoutes
);

app.use(
    "/api/warehouses",
    warehouseRoutes
);

app.use(
    "/api/inventory-categories",
    inventoryCategoryRoutes
);

app.use(
    "/api/inventory-items",
    inventoryItemRoutes
);

app.use(
    "/api/warehouse-stock",
    warehouseStockRoutes
);

app.use(
    "/api/inventory-transactions",
    inventoryTransactionRoutes
);

app.use(
    "/api/material-issuance-requests",
    materialIssuanceRequestRoutes
);

app.use(
    "/api/material-issuance-items",
    materialIssuanceItemRoutes
);

app.use(
    "/api/site-material-records",
    siteMaterialRecordRoutes
);

app.use(
    "/api/audit-logs",
    auditLogRoutes
);

app.use(
    "/api/system-settings",
    systemSettingsRoutes
);

app.use("/api/users", userRoutes);
app.use("/api/completion", completionRoutes);
// Root route

app.get("/", (req, res) => {

    res.json({
        message:
            "HR Builders CMS Backend is running"
    });

});


// Start server

const startServer = async () => {

    try {

        await pool.query("SELECT 1");

        console.log(
            "PostgreSQL connected successfully"
        );


        app.listen(PORT, () => {

            console.log(
                `Server running on http://localhost:${PORT}`
            );

        });

    } catch (error) {

        console.error(
            "PostgreSQL connection failed:"
        );

        console.error(
            error.message
        );

        process.exit(1);
    }
};


startServer();