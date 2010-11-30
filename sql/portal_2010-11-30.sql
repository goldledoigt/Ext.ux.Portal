# Sequel Pro dump
# Version 2492
# http://code.google.com/p/sequel-pro
#
# Host: 127.0.0.1 (MySQL 5.1.44)
# Database: portal
# Generation Time: 2010-11-30 17:22:34 +0100
# ************************************************************

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table portlets
# ------------------------------------------------------------

DROP TABLE IF EXISTS `portlets`;

CREATE TABLE `portlets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `config` text,
  `label` varchar(255) DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `group` varchar(255) DEFAULT NULL,
  `columnIndex` int(11) DEFAULT NULL,
  `collapsed` tinyint(4) DEFAULT '0',
  `weight` int(11) DEFAULT NULL,
  `enabled` tinyint(4) DEFAULT '0',
  `info` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;

LOCK TABLES `portlets` WRITE;
/*!40000 ALTER TABLE `portlets` DISABLE KEYS */;
INSERT INTO `portlets` (`id`,`config`,`label`,`icon`,`group`,`columnIndex`,`collapsed`,`weight`,`enabled`,`info`,`type`)
VALUES
	(1,'{\"title\":\"Widget 1\", \"html\":\"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Sed metus nibh, sodales a, porta at, vulputate eget, dui. Pellentesque ut nisl. Maecenas tortor turpis, interdum non, sodales non, iaculis ac, lacus. Vestibulum auctor, tortor quis iaculis malesuada, libero lectus bibendum purus, sit amet tincidunt quam turpis vel lacus. In pellentesque nisl non sem. Suspendisse nunc sem, pretium eget, cursus a, fringilla vel, urna.\"}','Widget 1','http://eco.netvibes.com/img/thumbnail/ginger/7/1/1/71102b7c312f8bb65fe03f8b3d5ee946-64-48.png?v=1260965853','group 1',NULL,0,NULL,0,'This widget is doing incredible things, just test it to see the magic !','gmap'),
	(2,'{\"title\":false,\"xtype\":\"rssreader\",\"url\":\"http://www.lemonde.fr/rss/une.xml\"}','Widget 2','http://eco.netvibes.com/img/thumbnail/ginger/e/7/3/e733ac82ea8a34e3ca20da7d26fc67b6-64-48.png?v=1260965733','group 1',0,0,2,1,'This widget is doing incredible things, just test it to see the magic !','rss'),
	(3,'{\"title\":\"Widget 3\", \"xtype\":\"iframe\", \"url\":\"http://google.com/\"}','Widget 3','http://eco.netvibes.com/img/thumbnail/ginger/8/7/e/87ef5f41ec84e7d16b9177a6b2e77dbd-64-48.png?v=1260965664','group 1',1,0,0,1,'This widget is doing incredible things, just test it to see the magic !','iframe'),
	(4,'{\"title\":\"Widget 4\", \"html\":\"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Sed metus nibh, sodales a, porta at, vulputate eget, dui. Pellentesque ut nisl. Maecenas tortor turpis, interdum non, sodales non, iaculis ac, lacus. Vestibulum auctor, tortor quis iaculis malesuada, libero lectus bibendum purus, sit amet tincidunt quam turpis vel lacus. In pellentesque nisl non sem. Suspendisse nunc sem, pretium eget, cursus a, fringilla vel, urna.\"}','Widget 4','http://eco.netvibes.com/img/thumbnail/ginger/7/5/5/755d9e1c1fdd5060c6aa03095ef9410c-64-48.png?v=1260965490','group 2',NULL,0,NULL,0,'This widget is doing incredible things, just test it to see the magic !','iframe'),
	(5,'{\"title\":\"Widget 5\", \"html\":\"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Sed metus nibh, sodales a, porta at, vulputate eget, dui. Pellentesque ut nisl. Maecenas tortor turpis, interdum non, sodales non, iaculis ac, lacus. Vestibulum auctor, tortor quis iaculis malesuada, libero lectus bibendum purus, sit amet tincidunt quam turpis vel lacus. In pellentesque nisl non sem. Suspendisse nunc sem, pretium eget, cursus a, fringilla vel, urna.\"}','Widget 5','http://eco.netvibes.com/img/thumbnail/ginger/3/7/5/3756afd1f9dcf0133231f42e6730a85e-64-48.png?v=1246544032','group 2',NULL,0,NULL,0,'This widget is doing incredible things, just test it to see the magic !','iframe'),
	(6,'{\"title\":\"Widget 6\", \"html\":\"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Sed metus nibh, sodales a, porta at, vulputate eget, dui. Pellentesque ut nisl. Maecenas tortor turpis, interdum non, sodales non, iaculis ac, lacus. Vestibulum auctor, tortor quis iaculis malesuada, libero lectus bibendum purus, sit amet tincidunt quam turpis vel lacus. In pellentesque nisl non sem. Suspendisse nunc sem, pretium eget, cursus a, fringilla vel, urna.\"}','Widget 6','http://eco.netvibes.com/img/thumbnail/ginger/7/a/9/7a95e6e5ebad071148a1f2553a96706d-64-48.png?v=1260964985','group 3',NULL,0,NULL,0,'This widget is doing incredible things, just test it to see the magic !','iframe'),
	(7,'{\"title\":\"Widget 7\", \"html\":\"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Sed metus nibh, sodales a, porta at, vulputate eget, dui. Pellentesque ut nisl. Maecenas tortor turpis, interdum non, sodales non, iaculis ac, lacus. Vestibulum auctor, tortor quis iaculis malesuada, libero lectus bibendum purus, sit amet tincidunt quam turpis vel lacus. In pellentesque nisl non sem. Suspendisse nunc sem, pretium eget, cursus a, fringilla vel, urna.\"}','Widget 7','http://eco.netvibes.com/img/thumbnail/ginger/5/7/4/57496d70227f4302cd71d44fdcc23cb0-64-48.png?v=1261481226','group 3',NULL,0,NULL,0,'This widget is doing incredible things, just test it to see the magic !','iframe'),
	(8,'{\"title\":\"Widget 8\", \"html\":\"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Sed metus nibh, sodales a, porta at, vulputate eget, dui. Pellentesque ut nisl. Maecenas tortor turpis, interdum non, sodales non, iaculis ac, lacus. Vestibulum auctor, tortor quis iaculis malesuada, libero lectus bibendum purus, sit amet tincidunt quam turpis vel lacus. In pellentesque nisl non sem. Suspendisse nunc sem, pretium eget, cursus a, fringilla vel, urna.\"}','Widget 8','http://eco.netvibes.com/img/thumbnail/ginger/0/1/2/0126bbd9b5eff8f61724c9bf66ff65f1-64-48.png?v=1260971979','group 3',NULL,0,NULL,0,'This widget is doing incredible things, just test it to see the magic !','iframe'),
	(9,'{\"title\":\"Widget 9\", \"html\":\"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Sed metus nibh, sodales a, porta at, vulputate eget, dui. Pellentesque ut nisl. Maecenas tortor turpis, interdum non, sodales non, iaculis ac, lacus. Vestibulum auctor, tortor quis iaculis malesuada, libero lectus bibendum purus, sit amet tincidunt quam turpis vel lacus. In pellentesque nisl non sem. Suspendisse nunc sem, pretium eget, cursus a, fringilla vel, urna.\"}','Widget 9','http://eco.netvibes.com/img/thumbnail/ginger/4/9/d/49d3cb466d1d400d5bf91cd67f8ece77-64-48.png?v=1260971994','group 3',NULL,0,NULL,0,'This widget is doing incredible things, just test it to see the magic !','iframe');

/*!40000 ALTER TABLE `portlets` ENABLE KEYS */;
UNLOCK TABLES;





/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
