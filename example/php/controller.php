<?php

function getPortlet($row) {
	$portlet = json_decode($row['config']);
	$portlet->title = 'Widget '. $row['id'];
	$portlet->itemId = $row['id'];
	$portlet->columnIndex = $row['columnIndex'];
	$portlet->weight = $row['weight'];
	$portlet->collapsed = ($row['collapsed'] == 1) ? true : false;
	return $portlet;
}

header('Content-Type:text/plain');

require_once 'mysql.php';

$R =& $_REQUEST;

$json = array();
$db = new mysql('localhost', 'root', 'root', 'portal');

if ($R['xaction'] === 'setItemPosition') {
	$query = 'UPDATE portlets SET weight = weight + 1 WHERE columnIndex = '.$R['columnIndex'].' AND weight >= '.$R['weight'];
	$db->query($query);
	$query = 'UPDATE portlets SET weight = '.$R['weight'].', columnIndex = '.$R['columnIndex'].', enabled = 1 WHERE id = '.$R['id'];
	$db->query($query);
}

else if ($R['xaction'] === 'removeItem') {
	$query = 'UPDATE portlets SET enabled = 0, weight = NULL, columnIndex = NULL WHERE id = '.$R['id'];
	$db->query($query);
}

else if ($R['xaction'] === 'getItems') {
	$json['data'] = array();
	$query = 'SELECT * FROM portlets WHERE enabled = 1';
	$res = $db->query($query);
	while ($row = $db->getAssoc($res)) {
		$json['items'][] = getPortlet($row);
	}
		
}

else if ($R['xaction'] === 'toggleItem') {
	$query = 'UPDATE portlets SET collapsed = '.$R['collapsed'].' WHERE id = '.$R['id'];
	$db->query($query);
}


$json['success'] = true;
print json_encode($json);

?>