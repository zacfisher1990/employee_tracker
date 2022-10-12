//todo: require variables

const mysql = require('mysql2');

const inquirer = require('inquirer');

const cTable = require('console.table'); 

require('dotenv').config();

const PORT = process.env.PORT || 3001;


const db = mysql.createConnection(
  {
    host: 'localhost',
  
    // MySQL username,
    user: 'root',
    // MySQL password
    password: process.env.DB_PASSWORD,
    database: 'employee_db'
  },

);

//todo: connect to database

    db.connect((err) => {
    if (err) throw err;
    else {
        prompts();
    }
})

 prompts = () => {
    inquirer.prompt ([
        {
            type: 'list',
            name: 'choices',
            message: 'What would you like to do?',
            choices: ['view all departments', 'view all roles', 'view all employees', 'add a department', 'add a role', 'add an employee', 'update an employee role']
        },

    ]).then((answers) => {
        const { choices } = answers;
        if (choices === 'view all departments') {
            departments();
        }
        if (choices === 'view all roles') {
            viewAllRoles();
        } 
        if (choices === 'view all employees') {
            viewAllRoles();
        } 
        if ( choices === 'view all employees') {
            employees();
        }
        if (choices === 'add a department') {
            addDepartment();
        } 
        if (choices === 'add a role') {
            addRole();
        }
        if (choices === 'add an employee') {
            addEmployee();
        }
        if (choices === 'update an employee role') {
            updateRole();
        }
    })
}

//view all departments function
departments = () => {
    const sql = `SELECT department.id AS id, department.name AS department FROM department`;

        db.query(sql, (err, rows) => {
        if (err) throw err;
        console.table(rows);
        
        prompts();
    })
};

//view all roles function

viewAllRoles = () => {
    const sql = `SELECT role.id, role.title, department.name AS department FROM role INNER JOIN department ON role.department_id = department.id`;

    db.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    prompts();
    })
};



//todo: employees function
employees = () => {
    const sql = `SELECT employee.id,
    employee.first_name,
    employee.last_name,
    role.title,
    department.name AS department,
    role.salary,
    CONCAT (manager.first_name, ' ', manager.last_name) AS manager 
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id`;

        db.query(sql, (err, rows) => {
        if (err) throw err;
        console.table(rows);
        prompts();
    })
}

//todo: add add a department
addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'addDep',
            message: 'What is the name of the department?',
            
        }
    ]).then(answer => {
        const sql = `INSERT INTO department (name) VALUES (?)`;
            db.query(sql, answer.addDep, (err, result) => {
            if (err) throw (err);
            console.log('Added ' + answer.addDep + ' to the database');
            
            departments();
        })
    })

}
//todo: add add role function
addRole = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'role',
            message: 'What is the name of the role?',
        },
        {
            type: 'input',
            name: 'salary',
            message: 'What is the salary of the role?',
        },
        {
            type: 'list',
            name: 'department',
            message: 'Which department does the role belong to?',
            choices: ['Engineering', 'Finance', 'Legal', 'Sales', 'Service']
        }
    ]).then(answer => {
        const roleSalary = [answer.role, answer.salary];

        const roleSql = `SELECT name, id FROM department`;

            db.query(roleSql, (err, data) => {
            if (err) throw err;

            

        })
    })

}
//todo: add add employee function

addEmployee = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: `What is the employee's first name?`,
        },
        {
            type: 'input',
            name: 'lastName',
            message: `What is the employee's last name?`,
        },
        {
            type: 'list',
            name: 'role',
            message: `What is the employee's role?`,
            choices: ['Account Manager', 'Accountant', 'Legal Team Lead', 'Lawyer', 'Customer Service', 'Sales Lead', 'Salesperson', 'Lead Engineer'],
        },
        {
            type: 'list',
            name: 'manager',
            message:   `Who is the employees manager?`,
            choices: []
        }

    ])
}

//todo: add update employee role function
updateRole = () => {

}


//default response
// app.use((req, res) => {
//     res.status(404).end();
//   });
  
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });

