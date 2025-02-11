const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300)
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20)
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  const bot = "./assets/bot.svg";
  const user = "./assets/user.svg";

  return (
    `
     <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
       <div class="profile">
        <img
         src="${isAi ? bot : user}"
         alt="${isAi ? 'bot' : 'user'}"
        />
       </div>
       <div class="message" id=${uniqueId}>${value}</div>
      </div>
     </div>
   `
  )
}

const handelSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId)

  loader(messageDiv)

  //fetch data from server -> bot's response
  
  // post to server endpoint
  
  const response = await fetch('/api/prompt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parseData = data.response.trim();

    typeText(messageDiv, parseData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something is not right";

    alert(err);
  }
}

form.addEventListener('submit', handelSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handelSubmit(e);
  }
})
