<?php
$queryUrl = 'https://b24-woekaw.bitrix24.ru/rest/1/52kkxdeve3op1sl9/crm.lead.add.json';
$quryAddProduct = 'https://b24-woekaw.bitrix24.ru/rest/1/52kkxdeve3op1sl9/crm.lead.productrows.set.json';
$queryData = http_build_query(array(
 'fields' => array(
	 "TITLE" => "title",
	 "NAME" => "Name",
	 "LAST_NAME" => "Last Name",
	 "OPENED" => "Y",
	 "CURRENCY_ID"=>'RUB',
	 "SOURCE_ID"=>'WEB',
	 "STATUS_ID"=>'NEW',
	 "ASSIGNED_BY_ID" => 1,
	 "PHONE" => array(array("VALUE" => "21211", "VALUE_TYPE" => "WORK" )),
	 "EMAIL" => array(array("VALUE" => "212@mail.ru", "VALUE_TYPE" => "WORK" )),
 ),
 'params' => array("REGISTER_SONET_EVENT" => "Y")
));
$result = json_decode(go_fgc($queryData, $queryUrl));

$id = $result->result;
$queryData = "";
$queryData = http_build_query(array(
 'rows' => array(
 	array(
 		"PRODUCT_ID" => 2, 
 		"PRICE" => 100.00, 
 		"QUANTITY" => 1
 	)
 ),
 'id' => $id
));

$result = go_fgc($queryData, $quryAddProduct);
print_r($result);

function go_curl($queryData, $queryUrl){
	$curl = curl_init();
	curl_setopt_array($curl, array(
		CURLOPT_SSL_VERIFYPEER => 0,
		CURLOPT_POST => 1,
		CURLOPT_HEADER => 0,
		CURLOPT_RETURNTRANSFER => 1,
		CURLOPT_URL => $queryUrl,
		CURLOPT_POSTFIELDS => $queryData,
	));

	$result = curl_exec($curl);
	curl_close($curl);
	$result = json_decode($result, 1);

	return $result;
}
function go_fgc($queryData, $queryUrl){
	$opts = array('http' =>
	    array(
	        'method'  => 'POST',
	        'header'  => 'Content-type: application/x-www-form-urlencoded',
	        'content' => $queryData
	    )
	);

	$context  = stream_context_create($opts);

	$result = file_get_contents($queryUrl, false, $context);
	return $result;
}