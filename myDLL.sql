CREATE DATABASE `login_service` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

-- login_service.ls_account definition

CREATE TABLE `ls_account` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appName` varchar(255) NOT NULL,
  `emailAddress` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `password` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `isLocked` tinyint(1) NOT NULL DEFAULT '0',
  `isMobile` tinyint(1) DEFAULT NULL,
  `mobileNumber` varchar(100) DEFAULT NULL,
  `forcePasswordChangeAt` timestamp NOT NULL,
  `otp` varchar(100) DEFAULT NULL,
  `otpExpier` timestamp NULL DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ls_account_unique` (`appName`,`emailAddress`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- login_service.ls_blacklist definition

CREATE TABLE `ls_blacklist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- login_service.ls_permission definition

CREATE TABLE `ls_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `link` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `roleId` int DEFAULT NULL,
  `rights` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ordering` int DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- login_service.ls_login_history definition

CREATE TABLE `ls_login_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `accountId` int NOT NULL,
  `ipAddress` varchar(255) NOT NULL,
  `userAgent` json NOT NULL,
  `createdAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ls_login_history_ibfk_1` (`accountId`),
  CONSTRAINT `ls_login_history_ibfk_1` FOREIGN KEY (`accountId`) REFERENCES `ls_account` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- login_service.ls_password_history definition

CREATE TABLE `ls_password_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `accountId` int NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ls_password_history_ibfk_1` (`accountId`),
  CONSTRAINT `ls_password_history_ibfk_1` FOREIGN KEY (`accountId`) REFERENCES `ls_account` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- login_service.ls_refresh_token definition

CREATE TABLE `ls_refresh_token` (
  `id` int NOT NULL AUTO_INCREMENT,
  `accountId` int NOT NULL,
  `token` longtext NOT NULL,
  `createdAt` datetime NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ls_refresh_token` (`accountId`),
  CONSTRAINT `ls_refresh_token` FOREIGN KEY (`accountId`) REFERENCES `ls_account` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=145 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- login_service.ls_role definition

CREATE TABLE `ls_role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appName` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `lsAccountId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ls_role_ibfk_1` (`lsAccountId`),
  CONSTRAINT `ls_role_ibfk_1` FOREIGN KEY (`lsAccountId`) REFERENCES `ls_account` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- login_service.ls_role_permission definition

CREATE TABLE `ls_role_permission` (
  `lsRoleId` int NOT NULL,
  `lsPermissionId` int NOT NULL,
  `level` varchar(100) NOT NULL,
  KEY `ls_role_permission_ibfk_1` (`lsPermissionId`),
  KEY `ls_role_permission_ibfk_2` (`lsRoleId`),
  CONSTRAINT `ls_role_permission_ibfk_1` FOREIGN KEY (`lsPermissionId`) REFERENCES `ls_permission` (`id`),
  CONSTRAINT `ls_role_permission_ibfk_2` FOREIGN KEY (`lsRoleId`) REFERENCES `ls_role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

