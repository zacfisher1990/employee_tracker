//require variables

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

// connect to database

    db.connect((err) => {
    if (err) throw err;
    else {
        prompts();
    }
})

//prompts function for main menu selections

 prompts = () => {
    inquirer.prompt ([
        {
            type: 'list',
            name: 'choices',
            message: 'What would you like to do?',
            choices: ['view all departments', 'view all roles', 'view all employees', 'add a department', 'add a role', 'add an employee', 'update an employee role']
        },
        //user choice leads to corresponding function
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
    //sql variable
    const sql = `SELECT department.id AS id, department.name AS department FROM department`;

        db.query(sql, (err, rows) => {
        if (err) throw err;
        
        console.table(rows); //shows the table
        
        prompts(); //calls prompts function for main menu
    })
};

//view all roles function

viewAllRoles = () => {
    const sql = `SELECT role.id, role.title, department.name 
                AS department, role.salary 
                FROM role 
                INNER JOIN department 
                ON role.department_id = department.id`;

    db.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    prompts();
    })
};



// View all employees function

employees = () => {
    const sql = `SELECT employee.id, employee.first_name, employee.last_name, role.title, 
                department.name AS department, role.salary,
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

//Add department
addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'addDep',
            message: 'What is the name of the department?'
        }
    ]).then(answer => {
        const sql = `INSERT INTO department (name) VALUES (?)`;
            db.query(sql, answer.addDep, (err, result) => {
            if (err) throw err;

            console.log('Added ' + answer.addDep + ' to the database');
            
            prompts();
        })
    })
};

// Add Role function
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
        }
    ]).then(answer => {
        const roleSalary = [answer.role, answer.salary];

        const roleSql = `SELECT name, id FROM department`;

            db.query(roleSql, (err, data) => {
            if (err) throw err;

            const dept = data.map(({ name, id }) => ({ name: name, value: id }));

            inquirer.prompt([
                {
                type: 'list',
                name: 'department',
                message: 'Which department does the role belong to?',
                choices: dept
                }
            ]).then(answerDep => {
                roleSalary.push(answerDep.department);

                const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;

                db.query(sql, roleSalary, (err, result) => {
                    if (err) throw err;
                    console.log('Added ' + answer.role + ' to the database');

                    prompts();
                })
                
            })
        })
    })
};


//Add employee function

addEmployee = () => {
    //employee name prompts
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
        }
        
    ]).then(answer => {
        const firstLastName = [answer.firstName, answer.lastName]

        const roleSql = `SELECT role.id, role.title FROM role`;

        db.query(roleSql, (err, data) => {
            if (err) throw err;

            let roles = data.map(({ id, title }) => ({ name: title, value: id }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'role',
                    message: `What is the employee's role?`,
                    choices: roles
                }
            ]).then(rolesAnswer => {
                const role = rolesAnswer.role;
                firstLastName.push(role);

                //manager
                const managerSql = `SELECT * FROM employee`;
                db.query(managerSql, (err, data) => {
                    if (err) throw err;

                    let managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, value: id }));

                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'manager',
                            message:   `Who is the employee's manager?`,
                            choices: managers
                        }
                    ]).then(managerAnswer => {
                        const manager = managerAnswer.manager;
                        firstLastName.push(manager);

                        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;

                        db.query(sql, firstLastName, (err, result) => {
                            if (err) throw err;

                            console.log('Added ' + answer.firstName + ' ' + answer.lastName + ' to the database');

                            prompts();
                        })
                    })
                })
            })
        })
    })
};

//update employee function

updateRole = () => {
    const employeeSql = `SELECT * FROM employee`;
    db.query(employeeSql, (err, data) => {
        if (err) throw err;

        const employeeList = data.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, value: id }));
        inquirer.prompt([
            {
                type: 'list',
                name: 'nameUpdate',
                message: `Which employee's role do you want to update?`,
                choices: employeeList
            }
        ]).then(nameUpdateAnswer => {
            const employee = nameUpdateAnswer.nameUpdate;
            const params = [];
            params.push(employee);

            const roleSql = `SELECT * FROM role`;
            db.query(roleSql, (err, data) => {
                if (err) throw err;

                const roles = data.map(({ id, title }) => ({ name: title, value: id }));

                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'roleUpdate',
                        message: 'Which role do you want to assign the selected employee?',
                        choices: roles
                    }
                ]).then(roleUpdateAnswer => {
                    const role = roleUpdateAnswer.roleUpdate;
                    params.push(role);
                    let employee = params[0]
                    params[0] = role
                    params[1] = employee

                    const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;

                    db.query(sql, params, (err, result) => {
                        if (err) throw err;
                        console.log(`Updated employee's role`);
                        prompts();
                    })
                })
            })
        })

    })
   
};


