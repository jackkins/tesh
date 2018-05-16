<?php
/****************MYSQL**************/
class Db{
	public $host = null;
	public $password = null;
	public $user = null;
	public $database = null;
	private $connect=false;
	private $mysql_connect = null;
	private $mysql_select_db = null;
	private $fetched = "";
		public function connect($database=null){
				$this->database = empty($database)? $this->database : $database;
				$this->mysql_connect = mysql_connect($this->host,$this->user,$this->password);
				
				if(!$this->mysql_connect){
					$this->connect=false;
					$this->ErrorView(mysql_error($this->mysql_connect));
					return false;
				}
				else{
					$this->mysql_select_db = mysql_select_db($this->database);
					if(!$this->mysql_select_db){
						$this->connect=false;
						$this->ErrorView(mysql_error($this->mysql_connect));
						return false;
					}
					else{
						$this->connect=true;
						return true;
					}
				}
		}
		public function select($what,$from,$where = null,$group=null,$order = null,$limit = null){   
			if($this->connect){
				$this->fetched = [];
				if(count($what)>1){
					$what=implode(",",$what);   
				}    
				$sql = 'SELECT '.$what.' FROM '.$from; 
				if($where != null) $sql .= ' WHERE '.$where; 
				if($group != null) $sql .= ' GROUP BY '.$group;
				if($order != null) $sql .= ' ORDER BY '.$order; 
				if($limit != null) $sql .= ' LIMIT '.$limit;
				//echo $sql;
				$query = mysql_query($sql);
				if($query){
					$rows = mysql_num_rows($query);
					for($i = 0; $i < $rows; $i++){ 
						$results = mysql_fetch_assoc($query);
						$key = array_keys($results);
						$numKeys = count($key);
						for($x = 0; $x < $numKeys; $x++)
							{
								$this->fetched[$i][$key[$x]] = $results[$key[$x]];
							} 
						}
					return $this->fetched;
				}
				else{
					$this->ErrorView(mysql_error($this->mysql_connect));
				}
			}
			else{
				return $this->ErrorView($this->notConnected());
			} 
		}
		public function insert($table,$values,$rows = null){ 
			if($this->connect){
				$insert = 'INSERT INTO `'.$table.'`'; 
				if($rows != null){ 
					for($i = 0; $i < count($rows); $i++){ 
						$rows[$i] = "`".$rows[$i]."`";						
					} 
					$rows = implode(",",$rows);
					$insert .= ' ('.$rows.')'; 
				} 
				$numValues = count($values);
				for($i = 0; $i < $numValues; $i++) 
					{ 
					 $values[$i] = "'".$values[$i]."'";
						
					} 
				$values = implode(',',$values); 
				$insert .= ' VALUES ('.$values.')';

				$ins = mysql_query($insert);
				if($ins) return true;
					else{
						$this->ErrorView(mysql_error($this->mysql_connect));
						return false;
					}
			}
			else{
				$this->ErrorView($this->notConnected());
				return false;
			}
		}
		public function update($table,$rows,$values,$where){
			if($this->connect){
				$sql="UPDATE ".$table." SET ";
				$countRow = count($rows);
				for($i=0;$i<$countRow;$i++){
					if($i==$countRow-1){
						$sql .=" `".$rows[$i]."`='".$values[$i]."' ";
					}
					else{
						$sql .=" `".$rows[$i]."`='".$values[$i]."', ";
					}
				}
				if(!empty($where)) $sql .= " WHERE ".$where;
				//echo $sql;
				$result=mysql_query($sql);
				if($result) return true;
				else{
					$this->ErrorView(mysql_error($this->mysql_connect));
					return false;
				}
			}
			else{
				$this->ErrorView($this->notConnected());
				return false;
			}		
		}  
		public function delete($table,$where = null){ 
			if($this->connect){
				$sql = 'DELETE FROM '.$table.' WHERE '.$where;
				if($where == null)
				{
					$sql = 'DELETE '.$table;
				}
				$deleted = @mysql_query($sql);
				if($deleted) return true;
					else{
						$this->ErrorView(mysql_error($this->mysql_connect));
						return false;
					}
			}
			else{
				$this->ErrorView($this->notConnected());
				return false;
			}
		}		
		public function closeConnection(){
			if($this->connect)
       		{  
				if(@mysql_close($this->mysql_connect))
           		{
                	$this->connect = false;
					return true;
            	}
				else
            	{
            		$this->ErrorView(mysql_error($this->mysql_connect));
					return false;
            	}
        	}
    	}
    	public function createTable($tableName,$rows,$values){
    		if($this->connect){
    			$sql=" CREATE table `".$tableName."`";
    			$countRows=count($rows);
				$countValues=count($values);
    			if($countRows!=$countValues){
    				$this->ErrorView($this->notConnected());
    			}
    			else{
    				$sql.=" (";
    				for($i=0;$i<$countRows;$i++){
    					$sql.=$rows[$i]." ".$values[$i];
    					if($i!=$countRows-1){
    						$sql.=", ";
    					}
    					
    				}
    				$sql.=")";
    				$result=mysql_query($sql);

    				if(!$result){
    					$this->ErrorView(mysql_error($this->mysql_connect));
    					return false;
    				}
    				else{
    					return true;
    				}
    			}

    		}	    		
    	}
    	public function mysqlQuery($query){
    		if($this->connect){
    			$result=mysql_query($query);
    			if(!$result){
    				$this->ErrorView(mysql_error($this->mysql_connect));
    			}
    			else{
					/*$tmp_arr = [];
					while($r = mysqli_fetch_array($result)){
						$tmp_arr[] = $r[0];
					}
    				return $tmp_arr;*/
					return $result;
    			}
    		}
    		else{
    			$this->ErrorView($this->notConnected());
    			return false;
    		}
    	}
		public function getListFields($table_name){
			$result_arr = [];
			$result = $this->mysqlQuery("SHOW COLUMNS FROM ".$table_name);
			while ($row = mysql_fetch_assoc($result)) {
				$result_arr[] = $row;
			}
			return $result_arr;
		}
		public function getListParamsFields($table_name,$param){
			$result = $this->getListFields($table_name);
			$tmp_arr = [];
			for($i=0;$i<count($result);$i++){
				$tmp_arr[] = $result[$i][$param];
			}
			return $tmp_arr;
		}
		public function getListTables(){
			$result = $this->mysqlQuery("show tables");
			$tmp_arr = [];
			while($r = mysql_fetch_array($result)){
				$tmp_arr[] = $r[0];
			}
			return $tmp_arr;
		}
		public function getListDatabases(){
			$result = $this->mysqlQuery("show databases");
			$tmp_arr = [];
			while($r = mysql_fetch_array($result)){
				$tmp_arr[] = $r[0];
			}
			return $tmp_arr;
		}
		public function createDB($db_name){
			$result = $this->mysqlQuery("SHOW DATABASES");
			$tmp_arr = [];
			while($r = mysql_fetch_array($result)){
				$tmp_arr[] = $r[0];
			}
			if(in_array($db_name,$tmp_arr)){
				$this->mysqlQuery("DROP DATABASE ".$db_name);
			}

			$res = $this->mysqlQuery("CREATE DATABASE ".$db_name);
			$this->connect($db_name);
			return $res;
			//$this->closeConnection();
		}
		/*
		public function importDataFromSqlFile($filepath){
			$sqlSource = file_get_contents($filepath);
			return mysqli_multi_query($this->mysql_connect,$sqlSource);
			//return $this->mysql_connect;
		}
		public function create_dump(){
			$command = "C:/xampp/mysql/bin/mysqldump --user=".$this->user." --password=".$this->password." --host=".$this->host." ".$_SESSION['db_name']." > ".$_SERVER['DOCUMENT_ROOT']."/testingdb/dump_files/".$_SESSION['db_name'].".sql";
			$return_var = NULL;
			$output = NULL;
			exec($command, $output, $return_var);
			if($return_var){
				return false;
			}
			else{
				return true;
			}
			//return $command;
		}
		*/
    	private function ErrorView($ex){
    		die($ex);
    	}
    	private function notConnected(){
    		return "Database not connected";
    	}
}