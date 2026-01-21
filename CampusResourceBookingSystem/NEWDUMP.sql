-- MySQL dump 10.13  Distrib 8.0.44, for macos15 (arm64)
--
-- Host: 127.0.0.1    Database: concordia_soen_proj
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `resources`
--

DROP TABLE IF EXISTS `resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `available` tinyint(1) NOT NULL,
  `type` varchar(250) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resources`
--

LOCK TABLES `resources` WRITE;
/*!40000 ALTER TABLE `resources` DISABLE KEYS */;
INSERT INTO `resources` VALUES (17,'Lab Alpha','Building A - Floor 1',1,'lab'),(18,'Lab Beta','Building A - Floor 2',0,'lab'),(19,'Lab Gamma','Building A - Floor 3',1,'lab'),(20,'Lab Delta','Building B - Floor 1',1,'lab'),(21,'Lab Epsilon','Building B - Floor 2',0,'lab'),(22,'Lab Zeta','Building C - Floor 1',1,'lab'),(23,'Lab Eta','Building C - Floor 2',1,'lab'),(24,'Lab Theta','Building D - Floor 1',0,'lab'),(25,'Lab Iota','Building D - Floor 2',1,'lab'),(26,'Lab Kappa','Building D - Floor 3',1,'lab'),(27,'Room A101','Hall A - Level 1',1,'room'),(28,'Room A102','Hall A - Level 2',0,'room'),(29,'Room A103','Hall A - Level 3',1,'room'),(30,'Room B201','Hall B - Level 1',1,'room'),(31,'Room B202','Hall B - Level 2',1,'room'),(32,'Room B203','Hall B - Level 3',0,'room'),(33,'Room C301','Hall C - Level 1',1,'room'),(34,'Room C302','Hall C - Level 2',1,'room'),(35,'Room C303','Hall C - Level 3',0,'room'),(36,'Room C304','Hall C - Level 4',1,'room'),(37,'Microscope X1','Storage Lab A',1,'equipment'),(38,'Projector P2','Storage Hall B',0,'equipment'),(39,'Oscilloscope O3','Storage Lab C',1,'equipment'),(40,'3D Printer M4','Workshop D',1,'equipment'),(41,'Soldering Station S5','Workshop E',0,'equipment'),(42,'Laser Cutter L6','Workshop F',1,'equipment'),(43,'VR Kit V7','Tech Storage A',1,'equipment'),(44,'Camera Rig C8','Media Room B',0,'equipment'),(45,'Server Rack R9','Data Center',1,'equipment'),(46,'Laptop Cart LC10','Classroom Storage',1,'equipment');
/*!40000 ALTER TABLE `resources` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-25 20:38:47
