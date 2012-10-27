var DEBUG = { normal: false };
var CONFIG = { standalone: true, https: true };

var https = require('https');
var io = require('socket.io');
var util = require('util');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var pem = require('pem');

var clientCount = 0;
var messageQueue = [];

var server;
if(CONFIG.standalone)
{
        if(CONFIG.https)
        {
		var serverCerts = {
	        	key: fs.readFileSync('ServerConfig/server.key'),
		        cert: fs.readFileSync('ServerConfig/server.cert')
		};

                server = https.createServer(serverCerts, ServerMain);
                server.listen('443');
        }
        else
        {
                server = http.createServer(ServerMain);
                server.listen('80');
        }
}
else
{
	var serverCerts = {
        	key: fs.readFileSync('ServerConfig/server.key'),
	        cert: fs.readFileSync('ServerConfig/server.cert')
	};

        server = https.createServer(serverCerts, function(){});
        server.listen('1337');
}
var socket = io.listen(server);

setupSocketIOOptions();
setupSocketIOEventHandlers();

function getContentType(uri)
{
	var extension = uri.substr(-3);

	switch(extension)
	{
		case 'htm':
		case 'tml':
			return 'text/html';
		break;

		case 'css':
			return 'text/css';
		break;

		case '.js':
			return 'text/javascript';
		break;
	}
}

function ServerMain(request, response)
{
        var request_uri = './www-root'+path.normalize(((request.url == '' || request.url == '/')?'/index.html':request.url));

	path.exists(request_uri, function(exists)
	{
		if(exists)
		{
			fs.readFile(request_uri, function(error, content)
			{
				if(error)
				{
					response.writeHead(500);
					response.end();
				}
				else
				{
					response.writeHead(200, { 'Content-Type': getContentType(request_uri) });
					response.end(content);
				}
			});
		}
		else
		{
			response.writeHead(404);
			response.end();
		}
	});	
}

function setupSocketIOEventHandlers()
{
	socket.on('connection', createSocketIOClient);
}

function setupSocketIOOptions()
{
	socket.enable('browser client minification');
	socket.enable('browser client etag');
	socket.enable('browser client gzip');
	socket.set('log level', 0);
	if(DEBUG.normal) socket.set('log level', 3);
	socket.set('transports',
		[
			'websocket',
			//'flashsocket',
			'htmlfile',
			'xhr-polling',
			'jsonp-polling'
		]
	);
}

function removeSocketIOClient()
{
	clientCount = clientCount - 1;
}

var B64Header = 'data:application/x-x509-ca-cert;base64,';
function createSocketIOClient(client)
{
	clientCount = clientCount + 1;
	client.on('disconnect', removeSocketIOClient);
	client.on('requestCert', function(data)
	{
		pem.createCertificate(data, function(error, data)
		{
			if(data)
			{
				var certData = {};

				certData.certificate = B64Header+Buffer(data.certificate).toString('base64');
				certData.certificateASC = data.certificate;
				certData.serviceKey = B64Header+Buffer(data.serviceKey).toString('base64');
				certData.serviceKeyASC = data.serviceKey;
				certData.clientKey = B64Header+Buffer(data.clientKey).toString('base64');
				certData.clientKeyASC = data.clientKey;
				certData.csr = B64Header+Buffer(data.csr).toString('base64');
				certData.csrASC = data.csr;
				certData.pem = B64Header+Buffer((certData.serviceKeyASC+"\n"+certData.certificateASC)).toString('base64');
				certData.pemASC = certData.serviceKeyASC+"\n"+certData.certificateASC;

				pem.readCertificateInfo(certData.certificateASC, function(error, data)
				{
					if(data)
					{
						certData.certInfo = data;

						pem.getPublicKey(certData.certificateASC, function(error, data)
						{
							if(data)
							{
								certData.publicKey = B64Header+Buffer(data.publicKey).toString('base64');
								certData.publicKeyASC = data.publicKey;

								client.emit('data', { type: 'newCert', data: certData });
							}
						});

					}
				});
			}
		});
	});
}
