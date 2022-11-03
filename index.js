const figlet = require("figlet");
const inquirer = require("inquirer");
const mysql = require("mysql2");
const ctable = require("console.table");

const db = mysql.createConnection(
  {
    host: "localhost",
    // MySQL username,
    user: "root",
    // MySQL password
    password: "password",
    database: "employees_db",
  },
  console.log(`Connected to the employees_db database.`)
);


function askQuestion() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "what would you like to do?",
        name: "prompt",
        choices: [
          "view all employees",
          "add employee",
          "update employee role",
          "view all roles",
          "add role",
          "view all departments",
          "add department",
          "quit",
        ],
      },
    ])
    .then((ans) => {
      switch (ans.prompt) {
        case "view all employees":
          db.query(
            `SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, role.title AS title, department.name AS department, role.salary AS salary, CONCAT(manager.first_name,' ',manager.last_name) AS manager 
            FROM employee 
            LEFT JOIN role on employee.role_id = role.id 
            LEFT JOIN department on role.department_id = department.id 
            LEFT JOIN employee AS manager ON employee.manager_id = manager.id`,
            (err, data) => {
              if (err) {
                throw err;
              } else {
                console.log("\n");
                console.table(data);
                console.log("\n");
                askQuestion();
              }
            }
          );
          break;
        case "add employee":
          db.query(
            `
          SELECT role.title
          FROM role
          `,
            function (err, results) {
              if (err) {
                throw err;
              }
              const roles = results.map((role) => role.title);
              db.query(
                `
              SELECT CONCAT(employee.first_name,' ',employee.last_name) AS manager  
              FROM employee
              `,
                function (err, results) {
                  const managers = results.map((obj) => obj.manager);
                  inquirer
                    .prompt([
                      {
                        type: "input",
                        message: "what is the employee's first name?",
                        name: "empFirstName",
                      },
                      {
                        type: "input",
                        message: "what is the employee's last name?",
                        name: "empLastName",
                      },
                      {
                        type: "list",
                        message: "what is the employee's role?",
                        name: "empRole",
                        choices: roles,
                      },
                      {
                        type: "list",
                        message: "who is the employee's manager?",
                        name: "empManager",
                        choices: managers,
                      },
                    ])
                    .then((response) => {
                      db.query(
                        `
                    SELECT role.id
                    FROM role WHERE role.title = '${response.empRole}'`,
                        function (err, results) {
                          const newRoleId = results[0].id;
                          db.query(
                            `
                      SELECT employee.id
                      FROM employee WHERE CONCAT(employee.first_name,' ',employee.last_name)='${response.empManager}'`,
                            function (err, results) {
                              const newManagerId = results[0].id;
                              db.query(`
                        INSERT INTO employee (first_name,last_name,role_id,manager_id)
                        VALUES ("${response.empFirstName}","${response.empLastName}",${newRoleId},${newManagerId})`);
                              console.log("\nemployee added!\n");
                              askQuestion();
                            }
                          );
                        }
                      );
                    });
                }
              );
            }
          );
          break;
        case "update employee role":
          db.query(
            `
          SELECT role.title
          FROM role
          `,
            function (err, results) {
              if (err) {
                throw err;
              }
              const roles = results.map((role) => role.title);
              db.query(
                `
              SELECT CONCAT(employee.first_name,' ',employee.last_name) AS employee  
              FROM employee
              `,
                function (err, results) {
    
                  const employees = results.map((obj) => obj.employee);
                  inquirer
                    .prompt([
                      {
                        type: "list",
                        message: "which employee's role do you want to update?",
                        name: "chosenEmp",
                        choices: employees,
                      },
                      {
                        type: "list",
                        message:
                          "which role do you want to assign to the selected employee?",
                        name: "newRole",
                        choices: roles,
                      },
                    ])
                    .then((response) => {
                      db.query(
                        `
                    SELECT role.id
                    FROM role WHERE role.title = '${response.newRole}'`,
                        function (err, results) {
                          const newRoleId = results[0].id;
                          db.query(
                            `
                          SELECT employee.id
                          FROM employee WHERE CONCAT(employee.first_name,' ',employee.last_name) = '${response.chosenEmp}'`,
                            function (err, results) {             
                              const chosenEmpId = results[0].id;
                              db.query(`
                            UPDATE employee
                            SET role_id = '${newRoleId}'
                            WHERE employee.id = '${chosenEmpId}'`);
                              console.log("\nemployee updated!\n");
                              askQuestion();
                            }
                          );
                        }
                      );
                    });
                }
              );
            }
          );
          break;
        case "view all roles":
          db.query(
            "SELECT role.id, role.title, role.salary, department.name AS department FROM role JOIN department ON role.department_id = department.id",
            (err, data) => {
              if (err) {
                throw err;
              } else {
                console.log("\n");
                console.table(data);
                console.log("\n");
                askQuestion();
              }
            }
          );
          break;
        case "add role":
          db.query(
            `
          SELECT department.name
          FROM department
          `,
            function (err, results) {
              if (err) {
                throw err;
              }
              const departments = results.map((department) => department.name);
              inquirer
                .prompt([
                  {
                    type: "input",
                    message: "what is the name of the role?",
                    name: "newRole",
                  },
                  {
                    type: "input",
                    message: "what is the salary of the role?",
                    name: "newSalary",
                  },
                  {
                    type: "list",
                    message: "what department does the role belong to?",
                    name: "newDepartment",
                    choices: departments,
                  },
                ])
                .then((response) => {
                  db.query(
                    `
                SELECT department.id
                FROM department WHERE department.name = '${response.newDepartment}'`,
                    function (err, results) {
                      const newDepId = results[0].id;
                      db.query(`
              INSERT INTO role (title,salary,department_id)
              VALUES ('${response.newRole}','${response.newSalary}',${newDepId})`);
                      console.log("\n role added!\n");
                      askQuestion();
                    }
                  );
                });
            }
          );
          break;
        case "view all departments":
          db.query(
            "SELECT department.id AS id, department.name AS name FROM department",
            (err, data) => {
              if (err) {
                throw err;
              } else {
                console.log("\n");
                console.table(data);
                console.log("\n");
                askQuestion();
              }
            }
          );
          break;
        case "add department":
          inquirer
            .prompt([
              {
                type: "input",
                message: "what is the name of the department?",
                name: "newDepartment",
              },
            ])
            .then((response) => {
              db.query(`
              INSERT INTO department (name)
              VALUES ('${response.newDepartment}')`);
              console.log("\n department added!\n");
              askQuestion();
            });

          break;

        default:
          console.log("goodbye!");
          db.end();
          break;
      }
    });
}
askQuestion();
