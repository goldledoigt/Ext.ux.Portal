<?php

header('Content-Type:text/plain');

require_once 'mysql.php';

$json = array();
$db = new mysql('localhost', 'root', 'root', 'portal');
$query = 'SELECT * FROM portlets ORDER BY `group`';
$res = $db->query($query);

function getPortlet($row) {
  $portlet = array();
  $portlet['config'] = json_decode($row['config']);
  $portlet['itemId'] = $row['id'];
  return $portlet;
}

$i = -1;
$group = '';
while ($row = $db->getAssoc($res)) {

  if ($group !== $row['group']) {
    $group = $row['group'];
    $i++;
  }

  $json[$i]['text'] = $group;
  $json[$i]['expanded'] = true;
  $portlet = getPortlet($row);
  $json[$i]['children'][] = array(
    'leaf' => true
    ,'text' => 'Widget ' .$row['id']
    ,'portlet' => $portlet
  );
  
}

print json_encode($json);

?>