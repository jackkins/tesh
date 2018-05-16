<?
class Pult_crypt {

    private $key = null;
    private $cipher = null;

    public function SetKey($string) {
        $this->key = $string;
    }

    public function SetCipher($string) {
        $this->cipher = $string;
    }

    public function SafeB64Encode($string) {
        $data = base64_encode($string);
        return str_replace(['+', '/', '='], ['-', '_', ''], $data);
    }

    public function SafeB64Decode($string) {
        $data = str_replace(['-', '_', ''], ['+', '/', '='], $string);
        $mod4 = strlen($data) % 4;
        if ($mod4) $data .= substr('====', $mod4);
        return base64_decode($data);
    }

    public function Encode($value) {
        if (!$value) return false;
        $ivsize = openssl_cipher_iv_length($this->cipher);
        $iv = openssl_random_pseudo_bytes($ivsize);
        $ciphertext = openssl_encrypt($value, $this->cipher, $this->key, OPENSSL_RAW_DATA, $iv);
        return trim($this->SafeB64Encode($iv . $ciphertext));
    }

    public function Decode($value) {
        if (!$value) return false;
        $value = $this->SafeB64Decode($value);
        $ivsize = openssl_cipher_iv_length($this->cipher);
        $iv = mb_substr($value, 0, $ivsize, '8bit');
        $ciphertext = mb_substr($value, $ivsize, null, '8bit');
        return trim(openssl_decrypt($ciphertext, $this->cipher, $this->key, OPENSSL_RAW_DATA, $iv));
    }

}
