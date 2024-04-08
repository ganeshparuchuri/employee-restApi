const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const port = 4000;

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/EmployeeDatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Define Employee schema
const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  phoneNo: { type: String, required: true },
  addressDetails: {
    hno: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
  },
  workExperience: [
    {
      companyName: { type: String, required: true },
      fromDate: { type: String, required: true },
      toDate: { type: String, required: true },
      address: { type: String, required: true },
    },
  ],
  qualifications: [
    {
      qualificationName: { type: String, required: true },
      fromDate: { type: String, required: true },
      toDate: { type: String, required: true },
      percentage: { type: Number, required: true },
    },
  ],
  projects: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
  ],
  photo: { type: String, default: "" },
});

const Employee = mongoose.model("Employee", employeeSchema);

app.use(bodyParser.json());

// CREATE AN EMPLOYEE
app.post("/employee", async (req, res) => {
  try {
    const employeeData = req.body;

    // Check if email already exists
    const existingEmployee = await Employee.findOne({
      email: employeeData.email,
    });
    if (existingEmployee) {
      return res
        .status(200)
        .json({ message: "Employee already exists", success: false });
    }

    // Create new employee
    const newEmployee = await Employee.create(employeeData);
    return res.status(200).json({
      message: "Employee created successfully",
      regid: newEmployee._id,
      success: true,
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    return res
      .status(500)
      .json({ message: "Employee creation failed", success: false });
  }
});

// UPDATE AN EMPLOYEE
app.put("/employee", async (req, res) => {
  try {
    const { regid, ...updatedEmployeeData } = req.body;

    // Check if employee with regid exists
    const existingEmployee = await Employee.findById(regid);
    if (!existingEmployee) {
      return res
        .status(200)
        .json({ message: "No employee found with this regid", success: false });
    }

    // Update employee data
    await Employee.findByIdAndUpdate(regid, updatedEmployeeData);
    return res.status(200).json({
      message: "Employee details updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return res
      .status(500)
      .json({ message: "Employee updation failed", success: false });
  }
});

// DELETE AN EMPLOYEE
app.delete("/employee", async (req, res) => {
  try {
    const { regid } = req.body;

    // Check if employee with regid exists
    const existingEmployee = await Employee.findById(regid);
    if (!existingEmployee) {
      return res
        .status(200)
        .json({ message: "No employee found with this regid", success: false });
    }

    // Delete employee
    await Employee.findByIdAndDelete(regid);
    return res
      .status(200)
      .json({ message: "Employee deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return res
      .status(500)
      .json({ message: "Employee deletion failed", success: false });
  }
});

// GET EMPLOYEE/EMPLOYEE LIST
app.get("/employee", async (req, res) => {
  try {
    const { regid } = req.query;

    if (regid) {
      // Fetch specific employee by regid
      const employee = await Employee.findById(regid);
      if (!employee) {
        return res.status(200).json({
          message: "Employee details not found",
          success: false,
          employees: [],
        });
      } else {
        return res.status(200).json({
          message: "Employee details found",
          success: true,
          employees: [employee],
        });
      }
    } else {
      // Fetch all employees
      const employees = await Employee.find();
      return res
        .status(200)
        .json({ message: "Employee details found", success: true, employees });
    }
  } catch (error) {
    console.error("Error retrieving employees:", error);
    return res.status(500).json({
      message: "Error retrieving employees",
      success: false,
      employees: [],
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
