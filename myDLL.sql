CREATE TABLE `ls_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appName` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(50) NOT NULL,
  `link` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ls_permission_unique` (`appName`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- login_service.ls_role definition

CREATE TABLE `ls_role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appName` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ls_role_unique` (`appName`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- login_service.ls_account definition

CREATE TABLE `ls_account` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appName` varchar(255) NOT NULL,
  `emailAddress` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `roleId` int NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `isLocked` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `forcePasswordChangeAt` timestamp NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ls_account_unique` (`appName`,`emailAddress`),
  KEY `roleId` (`roleId`),
  CONSTRAINT `ls_account_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `ls_role` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `ls_password_history` (
	`id` INT auto_increment NOT NULL,
	`accountId` INT NOT NULL,
	password LONGTEXT NOT NULL,
	CONSTRAINT `ls_password_history_pk` PRIMARY KEY (`id`),
  CONSTRAINT `ls_password_history_ibfk_1` FOREIGN KEY (`accountId`) REFERENCES `ls_account` (`id`)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `ls_login_history` (
	`id` INT auto_increment NOT NULL,
	`accountId` INT NOT NULL,
	`ipAddress` varchar(100) NOT NULL,
  `userAgent` varchar(255) NOT NULL,
  `createdAt` timestamp NULL DEFAULT NULL,
	CONSTRAINT `ls_login_history_pk` PRIMARY KEY (`id`),
  CONSTRAINT `ls_login_history_ibfk_1` FOREIGN KEY (`accountId`) REFERENCES `ls_account` (`id`)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
 