<?
class Pult {

    private $modules = [];
 
    public function Call($class, $method, $data) {
        include_once 'class/' . $class . '.php';

        if (!array_key_exists($class, $this->modules)) {
            $class_name = 'Pult_' . $class;
            $this->modules[$class] = new $class_name($this);
        }

        return $this->modules[$class]->$method($data);
    }

}

