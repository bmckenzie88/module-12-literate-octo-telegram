USE employees_db;

INSERT INTO department(name)
VALUES
("marketing"),
("human resources"),
("Sales"),
("Legal");
INSERT INTO role (title,salary,department_id)
VALUES
("lead strategist", 85000,1),
("marketing specialist", 65000,1),
("hr representative", 55000,2),
("hr manager", 85000,2),
("account executive",95000,3),
("account manager",60000,3),
("lawyer",75000,4);
INSERT INTO employee (first_name,last_name,role_id,manager_id)
VALUES
("Joe","Dirt",5,NULL),
("Nacho","Libre",6,1),
("Jake","Peralta",4,NULL),
("Shirley","Shemple",3,3),
("Polly","Darton",1,NULL),
("Spritney","Bears",2,5),
("Bimmy","Juffet",4,NULL)