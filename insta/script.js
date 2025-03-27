document.getElementById('votingForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    const formData = new FormData(event.target);
    const vote = formData.get('vote');

    // Display the result
    document.getElementById('resultText').innerText = `You voted for: ${vote}`;
    document.getElementById('result').classList.remove('hidden');
});

document.getElementById('voteInstagram').addEventListener('click', function() {
    window.location.href = 'instagram-login.html'; // Redirect to the Instagram login page
});

document.getElementById('voteEmail').addEventListener('click', function() {
    const selectedVote = document.querySelector('input[name="vote"]:checked');
    if (selectedVote) {
        const vote = selectedVote.value;
        document.getElementById('resultText').innerText = `You voted for: ${vote} using Email!`;
        document.getElementById('result').classList.remove('hidden');
    } else {
        alert('Please select an option before voting with Email.');
    }
});

// Function to create a notification
function createNotification(message, imageUrl) {
    const notification = document.createElement('div');
    notification.className = 'notification';

    // Create an image element
    const img = document.createElement('img');
    img.src = imageUrl; // Set the image source
    img.alt = 'User Image'; // Alt text for the image

    // Append the image and message to the notification
    notification.appendChild(img);
    notification.innerHTML += message; // Append the message text

    document.body.appendChild(notification);

    // Remove the notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Array of messages and corresponding images for notifications
const messages = [
    { text: "Someone from United Kingdom named Maddison Stevens just voted.", image: "image.png" },
    { text: "A user from Canada named John Doe just voted.", image: "https://via.placeholder.com/30" },
    { text: "An individual from Australia named Sarah Connor just voted.", image: "https://via.placeholder.com/30" },
    { text: "A participant from Germany named Hans Müller just voted.", image: "https://via.placeholder.com/30" },
    { text: "Someone from France named Marie Curie just voted.", image: "https://via.placeholder.com/30" },
    { text: "A voter from Japan named Akira Kurosawa just voted.", image: "https://via.placeholder.com/30" },
    { text: "An entrant from Brazil named João Silva just voted.", image: "https://via.placeholder.com/30" }
];

// Function to show notifications at intervals
function showNotifications() {
    let index = 0;
    const interval = setInterval(() => {
        createNotification(messages[index].text, messages[index].image);
        index = (index + 1) % messages.length; // Loop back to the start
    }, 4000); // Show a new notification every 4 seconds
}

// Start showing notifications
showNotifications();