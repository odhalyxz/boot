var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

const APP_TOKEN='EAAF3OvQEAwcBAM5wqHvea7sOWWDbbOE8uBYGPnRMenyK4lEz2VLFKB0rlmzQ9aPSVtRvV42uAnVHIJXKZAPtmK8OqQX3ASvzDXl7lN5TDzBH7w2ih3cI2qeo2efpKTsYXaS7VBwy2JZA4SRSpExOuZBo3UyYvW5tj1W2FBOUQZDZD';
var app = express();
app.use(bodyParser.json());

//Que puerto usaremos
app.listen(8003,function(){
	console.log("Servidor se encuentra en el puerto 8003");
});

//Configuro mi preimera ruta
app.get('/',function(req,res){
	res.send('Bienvenido');
});

app.get('/webhook',function(req,res){
	if(req.query['hub.verify_token']== 'test_token_say_4090771') //verificar el token
	{
		res.send(req.query['hub.challenge']) //Enviarle a facebook

	}else{
		res.send('Acceso denegado :P');
	}
});

app.post('/webhook', function(req, res){

	var data = req.body;
	if(data.object == 'page'){ //object page de facebook
	
		data.entry.forEach(function(pageEntry){
			pageEntry.messaging.forEach(function(messagingEvent){
				
				if(messagingEvent.message){ //Sis exite un mensaje
					recibirMensaje(messagingEvent);	
				}
			
			});
		});
		res.sendStatus(200);//Para decirle al servidor de fabook que ya recibi el mensaje
	}
});


function recibirMensaje(event){//Obtener los datos del mensaje
	var senderID = event.sender.id;//Este es el id de quien envio el mensaje
	var messageText = event.message.text;//Este es el mensaaje


	evaluateMessage(senderID, messageText);
}

function evaluateMessage(recipientId ,message){
	var finalMessage = '';

	if(isContain(message, 'ayuda')){
		finalMessage = 'Por el momento no te puedo ayudar';

	}else if(isContain(message, 'gato')){

	 enviarImagen(recipientId);

	}else if(isContain(message, 'info')){

	 enviarTemplate(recipientId);

	}else{
		finalMessage = 'solo se repetir las cosas :( : ' + message;
	}
	enviarMensajeTexto(recipientId,finalMessage);
}

function enviarMensajeTexto(recipientId, message){
	var messageData = {//Es muy importante mantener esta estructura 
		recipient : {//para que el servidor de facebook lo reciba
			id : recipientId//
		},
		message: {
			text: message
		}
	};
	callSendAPI(messageData);
}

function enviarImagen(recipientId){
	var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: "http://i.imgur.com/SOFXhd6.jpg"
        }
      }
    }
  };
	callSendAPI(messageData);
}


function enviarTemplate(recipientId){
	var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [ elemenTemplate() ]
        }
      }
    }
  };
	callSendAPI(messageData);
}

function elemenTemplate(){
	return {
	  title: "Odalys Paz Mendoza",
	  subtitle: "Primer Bot",
	  item_url: "https://www.facebook.com/kryxthalk.paz",               
	  image_url: "http://i.imgur.com/SOFXhd6.jpg",
	  buttons: [ buttonTemplate() ],
  }
}

function buttonTemplate(){
	return{
		type: "web_url",
		url : "https://www.facebook.com/kryxthalk.paz",
		title : "Primer Bot"
	}
}

function callSendAPI(messageData){//Recibe una estrcutura
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs : { access_token :  APP_TOKEN },
		method: 'POST',
		json: messageData //Enviar la estructura del mensaje
	}, function(error, response, data){

		if(error){
			console.log('No es posible enviar el mensaje');
		}else{
			console.log("El mensaje fue enviado");
		}

	});
}

function isContain(sentence, word){
	return sentence.indexOf(word) > -1;//funcion para ver si la palarabra se encuentra dentro de la frase
}