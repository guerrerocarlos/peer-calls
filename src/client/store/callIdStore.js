function isPasswordRequired() {
  return window.document.getElementById('passwordRequired').value === 'true';
}

function getCallId() {
  return window.document.getElementById('callId').value;
}

module.exports = { getCallId, isPasswordRequired };
