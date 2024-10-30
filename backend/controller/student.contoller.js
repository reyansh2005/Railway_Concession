const db = require("../model");
const Student = db.student;
const Op = db.Sequelize.Op;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "your_secret_key"; // Replace this with an actual secret key

// Create and Save a new Student
exports.create = async (req, res) => {
    // Validate request
    if (!req.body.name || !req.body.email_id || !req.body.phone_no) {
        res.status(400).send({
            message: "Content cannot be empty!"
        });
        return;
    }

    // Create a Student
    const student = {
        name: req.body.name,
        dob: req.body.dob,
        gender: req.body.gender,
        age: req.body.age,
        address: req.body.address,
        street: req.body.street,
        city: req.body.city,
        phone_no: req.body.phone_no,
        email_id: req.body.email_id,
        college_id: req.body.college_id
    };

    // Save Student in the database
    try {
        const data = await Student.create(student);
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Student."
        });
    }
};

// Retrieve all Students from the database.
exports.findAll = async (req, res) => {
    const name = req.query.name;
    const condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

    try {
        const data = await Student.findAll({ where: condition });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving Students."
        });
    }
};

// Find a single Student by id
exports.findOne = async (req, res) => {
    const id = req.params.id;

    try {
        const data = await Student.findByPk(id);
        if (data) {
            res.send(data);
        } else {
            res.status(404).send({
                message: `Cannot find Student with id=${id}.`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error retrieving Student with id=" + id
        });
    }
};

// Update a Student by the id in the request
exports.update = async (req, res) => {
    const id = req.params.id;

    try {
        const num = await Student.update(req.body, { where: { uid: id } });
        if (num == 1) {
            res.send({
                message: "Student was updated successfully."
            });
        } else {
            res.send({
                message: `Cannot update Student with id=${id}. Maybe Student was not found or req.body is empty!`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error updating Student with id=" + id
        });
    }
};

// Delete a Student with the specified id in the request
exports.delete = async (req, res) => {
    const id = req.params.id;

    try {
        const num = await Student.destroy({ where: { uid: id } });
        if (num == 1) {
            res.send({
                message: "Student was deleted successfully!"
            });
        } else {
            res.send({
                message: `Cannot delete Student with id=${id}. Maybe Student was not found!`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Could not delete Student with id=" + id
        });
    }
};


// User Authentication using JWT
exports.login = async (req, res) => {
    const { email_id, password } = req.body;

    // Check if student exists
    const student = await Student.findOne({ where: { email_id } });
    if (!student) {
        return res.status(404).send({ message: "Student not found" });
    }

    // Validate password (assuming password is stored hashed in the Student model)
    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
        return res.status(401).send({ message: "Invalid password" });
    }

    // Generate JWT
    const token = jwt.sign({ id: student.uid, email: student.email_id }, SECRET_KEY, {
        expiresIn: "1h"
    });

    res.send({ message: "Authentication successful", token });
};

// Register a Student with password hashing
exports.register = async (req, res) => {
    const { name, email_id, phone_no, password } = req.body;
    console.log(name, email_id, phone_no, password);
    if (!name || !email_id || !phone_no || !password) {
        res.status(400).send({
            message: "Content cannot be empty!"
        });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const student = await Student.create({
            name,
            email_id,
            phone_no,
            password: hashedPassword
        });
        res.send(student);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while registering the Student."
        });
    }
};
