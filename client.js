var socket = io.connect('/');

socket.on('data', recieveResults);
socket.on('connect', function()
{
	document.getElementById("connectionStatus").innerHTML = '<b><span style="color: green;">Connected</span></b>';
});

socket.on('disconnect', function()
{
	document.getElementById("connectionStatus").innerHTML = '<b><span style="color: red;">Disconnected</span></b>';
});

function initPage()
{
	document.getElementById("submit").addEventListener('click', requestCert, false);
}

function recieveResults(data)
{
	var response = '';

	if(data.type === 'newCert')
	{
		var newCert = data.data;

		var serviceKey = document.getElementById('serviceKey');
		serviceKey.href = newCert.serviceKey;
		document.getElementById('serviceKeyASC').value = newCert.serviceKeyASC;

		var clientKey = document.getElementById('clientKey');
		clientKey.href = newCert.clientKey;
		document.getElementById('clientKeyASC').value = newCert.clientKeyASC;

		var certificate = document.getElementById('certificate');
		certificate.href = newCert.certificate;
		document.getElementById('certificateASC').value = newCert.certificateASC;

		var csr = document.getElementById('csr');
		csr.href = newCert.csr;
		document.getElementById('csrASC').value = newCert.csrASC;

		var pem = document.getElementById('pem');
		pem.href = newCert.pem;
		document.getElementById('pemASC').value = newCert.pemASC;

		var publicKey = document.getElementById('publicKey');
		publicKey.href = newCert.publicKey;
		document.getElementById('publicKeyASC').value = newCert.publicKeyASC;

		var certInfo = newCert.certInfo;

		var str = '';
		str += 'commonName: '+certInfo.commonName+'<br>';
		str += 'country: '+certInfo.country+'<br>';
		str += 'emailAddress: '+certInfo.emailAddress+'<br>';
		str += 'locality: '+certInfo.locality+'<br>';
		str += 'organization: '+certInfo.organization+'<br>';
		str += 'organizationUnit: '+certInfo.organizationUnit+'<br>';
		str += 'state: '+certInfo.state;

		document.getElementById('certInfo').innerHTML = str;
	}

	enableClick();
}

function requestCert()
{
	var data = 
	{
		keyBitsize: document.getElementById('keyBitsize').value,
		days: document.getElementById('days').value,
		hash: document.getElementById('hash').value,
		country: document.getElementById('country').value,
		state: document.getElementById('state').value,
		locality: document.getElementById('locality').value,
		organization: document.getElementById('organization').value,
		organizationUnit: document.getElementById('organizationUnit').value,
		commonName: document.getElementById('commonName').value,
		emailAddress: document.getElementById('emailAddress').value
	}

	document.getElementById('serviceKey').href = '#';
	document.getElementById('clientKey').href = '#';
	document.getElementById('certificate').href = '#';
	document.getElementById('csr').href = '#';
	document.getElementById('pem').href = '#';
	document.getElementById('publicKey').href = '#';

	document.getElementById('serviceKeyASC').value = '';
	document.getElementById('clientKeyASC').value = '';
	document.getElementById('certificateASC').value = '';
	document.getElementById('csrASC').value = '';
	document.getElementById('pemASC').value = '';
	document.getElementById('publicKeyASC').value = '';
	document.getElementById('certInfo').innerHTML = '';

	socket.emit("requestCert", data);

	disableClick();
}

function disableClick()
{
	document.getElementById('submit').value = 'Please Wait...';
	document.getElementById('submit').disabled = true;
}

function enableClick()
{
	document.getElementById('submit').value = 'Send Request';
	document.getElementById('submit').disabled = false;
}
