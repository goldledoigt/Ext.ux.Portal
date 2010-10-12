<?php

header('Content-Type:text/plain');

require_once 'mysql.php';

$json = array();
$db = new mysql('localhost', 'root', 'root', 'portal');
$query = 'SELECT * FROM portlets ORDER BY `group`';
$res = $db->query($query);

function getPortlet($row) {
	$portlet = json_decode($row['config']);
	$portlet->title = 'Widget '. $row['id'];
	$portlet->itemId = $row['id'];
	$portlet->columnIndex = $row['columnIndex'];
	$portlet->weight = $row['weight'];
	$portlet->collpased = $row['collapsed'];
	return $portlet;
}

while ($row = $db->getAssoc($res)) {
	$group = $row['group'] - 1;
	if (!isset($json[$group])) {
		$json[$group]['text'] = 'Group '. ($group + 1);
		$json[$group]['expanded'] = true;
	}
	$portlet = getPortlet($row);
	$json[$group]['children'][] = array(
		'leaf' => true
		,'text' => 'Widget '. $row['id']
		,'portlet' => $portlet
	);
}

print json_encode($json);

?>