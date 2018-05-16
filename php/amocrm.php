<?php
/**
* 
*/
class ClassAmoCrm
{
	// Public vars
	public $lead_name = "";
	public $contact_name = "";
	public $contact_phone = "";
	public $contact_email = "";

	// Private vars
	private $responsible_user_id = 9166332;
	private $lead_status_id = '9168';
	private $user=array(
		'USER_LOGIN'=>'sale@direct-all-in.ru',
		'USER_HASH'=>'bbe59a8ca278e38ab62e2d8d2bffeb9b'
	);
	private $subdomain='directallin';

	public function sendAmo(){
		$link='https://'.$this->subdomain.'.amocrm.ru/private/api/auth.php?type=json';
		$curl=curl_init(); 
		curl_setopt($curl,CURLOPT_RETURNTRANSFER,true);
		curl_setopt($curl,CURLOPT_USERAGENT,'amoCRM-API-client/1.0');
		curl_setopt($curl,CURLOPT_URL,$link);
		curl_setopt($curl,CURLOPT_POST,true);
		curl_setopt($curl,CURLOPT_POSTFIELDS,http_build_query($this->user));
		curl_setopt($curl,CURLOPT_HEADER,false);
		curl_setopt($curl,CURLOPT_COOKIEFILE,dirname(__FILE__).'/cookie.txt');
		curl_setopt($curl,CURLOPT_COOKIEJAR,dirname(__FILE__).'/cookie.txt');
		curl_setopt($curl,CURLOPT_SSL_VERIFYPEER,0);
		curl_setopt($curl,CURLOPT_SSL_VERIFYHOST,0);
		$out=curl_exec($curl);
		$code=curl_getinfo($curl,CURLINFO_HTTP_CODE);
		curl_close($curl);
		$Response=json_decode($out,true);

		$link='https://'.$this->subdomain.'.amocrm.ru/private/api/v2/json/accounts/current';
		$curl=curl_init();
		curl_setopt($curl,CURLOPT_RETURNTRANSFER,true);
		curl_setopt($curl,CURLOPT_USERAGENT,'amoCRM-API-client/1.0');
		curl_setopt($curl,CURLOPT_URL,$link);
		curl_setopt($curl,CURLOPT_HEADER,false);
		curl_setopt($curl,CURLOPT_COOKIEFILE,dirname(__FILE__).'/cookie.txt');
		curl_setopt($curl,CURLOPT_COOKIEJAR,dirname(__FILE__).'/cookie.txt');
		curl_setopt($curl,CURLOPT_SSL_VERIFYPEER,0);
		curl_setopt($curl,CURLOPT_SSL_VERIFYHOST,0);
		$out=curl_exec($curl);
		$code=curl_getinfo($curl,CURLINFO_HTTP_CODE);
		curl_close($curl);
		$Response=json_decode($out,true);
		/*echo "<pre>";
		print_r($Response);
		echo "</pre>";*/

		$account=$Response['response']['account'];
		$amoAllFields = $account['custom_fields'];
		$amoConactsFields = $account['custom_fields']['contacts']; 
		$sFields = array_flip(array(
				'PHONE', 
				'EMAIL'
			)
		);
		foreach($amoConactsFields as $afield) {
			if(isset($sFields[$afield['code']])) {
				$sFields[$afield['code']] = $afield['id'];
			}
		}


		$leads['request']['leads']['add']=array(
			array(
				'name' => $this->lead_name,
				'status_id' => $this->lead_status_id, 
				'responsible_user_id' => $this->responsible_user_id,
				//'date_create'=>1298904164, //optional
				//'price'=>300000,
				//'tags' => 'Important, USA', #Теги
				'custom_fields'=>array(
					array(
						'id' => 602677,
						'values' => array(
							array(
								'value' => 'Сайт'
							)
						)
					),
					array(
						'id' => 602679,
						'values' => array(
							array(
								'value' => $this->lead_name
							)
						)
					)
				)
			)
		);
		$link='https://'.$this->subdomain.'.amocrm.ru/private/api/v2/json/leads/set';
		$curl=curl_init();
		curl_setopt($curl,CURLOPT_RETURNTRANSFER,true);
		curl_setopt($curl,CURLOPT_USERAGENT,'amoCRM-API-client/1.0');
		curl_setopt($curl,CURLOPT_URL,$link);
		curl_setopt($curl,CURLOPT_CUSTOMREQUEST,'POST');
		curl_setopt($curl,CURLOPT_POSTFIELDS,json_encode($leads));
		curl_setopt($curl,CURLOPT_HTTPHEADER,array('Content-Type: application/json'));
		curl_setopt($curl,CURLOPT_HEADER,false);
		curl_setopt($curl,CURLOPT_COOKIEFILE,dirname(__FILE__).'/cookie.txt');
		curl_setopt($curl,CURLOPT_COOKIEJAR,dirname(__FILE__).'/cookie.txt');
		curl_setopt($curl,CURLOPT_SSL_VERIFYPEER,0);
		curl_setopt($curl,CURLOPT_SSL_VERIFYHOST,0);
		$out=curl_exec($curl);
		$code=curl_getinfo($curl,CURLINFO_HTTP_CODE);
		$Response=json_decode($out,true);
		if(is_array($Response['response']['leads']['add']))
			foreach($Response['response']['leads']['add'] as $lead) {
				$lead_id = $lead["id"];
			};

		//ДОБАВЛЕНИЕ КОНТАКТА
		$contact = array(
			'name' => $this->contact_name,
			'linked_leads_id' => array($lead_id),
			'responsible_user_id' => $this->responsible_user_id, 
			'custom_fields'=>array(
				array(
					'id' => $sFields['PHONE'],
					'values' => array(
						array(
							'value' => $this->contact_phone,
							'enum' => 'MOB'
						)
					)
				),
				array(
					'id' => $sFields['EMAIL'],
					'values' => array(
						array(
							'value' => $this->contact_email,
							'enum' => 'WORK'
						)
					)
				)
			)
		);
		$set['request']['contacts']['add'][]=$contact;
		$link='https://'.$this->subdomain.'.amocrm.ru/private/api/v2/json/contacts/set';
		$curl=curl_init();
		curl_setopt($curl,CURLOPT_RETURNTRANSFER,true);
		curl_setopt($curl,CURLOPT_USERAGENT,'amoCRM-API-client/1.0');
		curl_setopt($curl,CURLOPT_URL,$link);
		curl_setopt($curl,CURLOPT_CUSTOMREQUEST,'POST');
		curl_setopt($curl,CURLOPT_POSTFIELDS,json_encode($set));
		curl_setopt($curl,CURLOPT_HTTPHEADER,array('Content-Type: application/json'));
		curl_setopt($curl,CURLOPT_HEADER,false);
		curl_setopt($curl,CURLOPT_COOKIEFILE,dirname(__FILE__).'/cookie.txt');
		curl_setopt($curl,CURLOPT_COOKIEJAR,dirname(__FILE__).'/cookie.txt');
		curl_setopt($curl,CURLOPT_SSL_VERIFYPEER,0);
		curl_setopt($curl,CURLOPT_SSL_VERIFYHOST,0);
		$out=curl_exec($curl);
		$code=curl_getinfo($curl,CURLINFO_HTTP_CODE);
		$Response=json_decode($out,true);
	}
}