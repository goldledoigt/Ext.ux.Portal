<?php

// mysql.php for mysql classe in /home/gary/www/dev/AXS_datagrid
// 
// Made by Gary van Woerkens
// Contact   <gary@chewam.com>
// 
// Started on  Thu Feb 11 20:14:35 2010 Gary van Woerkens
// Last update Thu Feb 11 20:34:39 2010 Gary van Woerkens
//

class mysql {

    private $link;
    private $host;
    private $user;
    private $password;
    private $database;
    private $current_query;

    public function __construct($db_host=false, $db_user=false, $db_pass=false, $db_name=false) {
        if (!$db_host) {
            global $db_host, $db_user, $db_pass, $db_name;
        }
        $this->host = $db_host;
        $this->user = $db_user;
        $this->password = $db_pass;
        $this->database = $db_name;
        $this->connect();
        $this->select_db();
    }

    public function connect() {
        $this->link = mysql_connect($this->host, $this->user, $this->password)
        or $this->error("cannot connect");
    }

    public function select_db() {
        mysql_select_db($this->database, $this->link)
        or $this->error("cannot select database");
    }

    public function insert($query) {
        $this->current_query = $query;
        if ($this->query($query))
            return $this->last_insert();
    }

    public function query($query) {
        $this->current_query = $query;
        if ($result = mysql_query($query, $this->link))
            return $result;
        else $this->error("cannot execute query");
    }

    public function last_insert() {
	    return mysql_insert_id($this->link);
    }

    public function getObj($resource) {
	    return mysql_fetch_object($resource);
    }

    public function getAssoc($resource) {
	    return mysql_fetch_assoc($resource);
    }

    public function getRows($ressource){
	    return mysql_fetch_row($ressource);
    }

    public function getArray($result) {
        if ($this->numrows($result)) {
            $array = mysql_fetch_array($result);
            return $array;
        } else return false;
    }

    public function numrows($resource) {
	    return mysql_num_rows($resource);
    }

    public function free($resource) {
        return mysql_free_result($resource)
	    or $this->error("cannot free resource");
    }

    private function error($str) {
        $str .= ":\r" . $this->current_query . "\r\r";
        $str .= "MySQL server returns :\r" . mysql_error();
        die($str);
    }

    public function close() {
        mysql_close($this->link)
        or $this->error("cannot close connection");
    }

    public function __destruct() {
    	$this->close();
    }

}

?>
