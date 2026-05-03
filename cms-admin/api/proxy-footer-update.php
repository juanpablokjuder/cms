<?php declare(strict_types=1);
require_once __DIR__ . '/../includes/functions.php';
if (!isAuthenticated()) { jsonResponse(['success'=>false,'message'=>'No autenticado.','code'=>'UNAUTHORIZED'],401); }
if ($_SERVER['REQUEST_METHOD']!=='POST') { jsonResponse(['success'=>false,'message'=>'Método no permitido.'],405); }
$input = json_decode(file_get_contents('php://input'),true)??[];
$uuid  = trim($input['uuid']??'');
if (empty($uuid)) { jsonResponse(['success'=>false,'message'=>'UUID es requerido.'],422); }
$data = [];
foreach (['columnas_count','copyright_text'] as $f) { if (array_key_exists($f,$input)) $data[$f]=$input[$f]; }
foreach (['columnas','redes','legales'] as $f) { if (array_key_exists($f,$input)&&is_array($input[$f])) $data[$f]=$input[$f]; }
if (empty($data)) { jsonResponse(['success'=>false,'message'=>'No se proporcionaron campos.'],422); }
$result = apiRequest('PATCH','/footer/'.urlencode($uuid),$data);
if ($result['httpCode']===401){destroySession();jsonResponse(['success'=>false,'message'=>'Sesión expirada.','code'=>'UNAUTHORIZED'],401);}
jsonResponse($result['body'],$result['httpCode']);
