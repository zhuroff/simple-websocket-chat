const chat = document.querySelector('#chat')
const form = document.querySelector('#form')
const ws = new WebSocket('ws://127.0.0.1:8000')

interface Message {
	name: string
	message: string
}

ws.onmessage = (message) => {
	const messages = JSON.parse(message.data)
	
	messages.forEach((el: Message) => {
		const messageElement = `<p><strong style="display: block">${el.name}</strong><span>${el.message}</span></p>`

		chat!.innerHTML += messageElement
	})
}

const send = (event: Event) => {
	event.preventDefault()

	const name = (<HTMLInputElement>document.querySelector('#name')).value
	const message = (<HTMLTextAreaElement>document.querySelector('#message')).value

	ws.send(JSON.stringify({ name, message }));

	(<HTMLTextAreaElement>document.querySelector('#message')).value = ''
}

form?.addEventListener('submit', send)