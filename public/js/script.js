// public/js/script.js

// Check if the user is logged in
function checkLogin() {
    if (window.location.pathname === '/index.html' && !localStorage.getItem('loggedIn')) {
        alert('You need to log in to access the expense tracker!');
        window.location.href = 'signup.html'; // Redirect to login if not logged in
    }
}

// Handle Signup Form Submission
document.getElementById('signup-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        alert('Signup successful! Redirecting to login...');
        window.location.href = 'login.html'; // Redirect to login page
    } else {
        const error = await response.json();
        alert(error.message);
    }
});

// Handle Login Form Submission
document.getElementById('login-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        const data = await response.json();
        alert('Login successful! Redirecting to expense tracker...');
        localStorage.setItem('loggedIn', 'true'); // Set login status in localStorage
        localStorage.setItem('userID', data.userID); // Store userID in localStorage
        localStorage.setItem('userName', data.username); // Store username for pre-fill
        window.location.href = 'index.html'; // Redirect to expense tracker
    } else {
        const error = await response.json();
        alert(error.message);
    }
});

// Handle Expense Form Submission
document.getElementById('expense-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const userID = localStorage.getItem('userID'); // Get userID from localStorage

    const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, description, category, userID })
    });

    if (response.ok) {
        alert('Expense added successfully!');
        document.getElementById('expense-form').reset(); // Reset the form
        loadExpenses(); // Reload the expenses
    } else {
        const error = await response.json();
        alert(error.message);
    }
});

// Load Expenses Function
async function loadExpenses() {
    const userID = localStorage.getItem('userID'); // Get userID from localStorage
    const response = await fetch(`/api/expenses/${userID}`);
    const expenses = await response.json();
    const expenseList = document.getElementById('expense-list');
    expenseList.innerHTML = '';

    expenses.forEach(expense => {
        const li = document.createElement('li');
        li.textContent = `${expense.description} - $${expense.amount} (${expense.category})`;
        
        // Create a delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = async () => {
            const deleteResponse = await fetch(`/api/expenses/${expense.id}/${userID}`, {
                method: 'DELETE'
            });
            if (deleteResponse.ok) {
                alert('Expense deleted successfully!');
                loadExpenses(); // Reload expenses
            } else {
                const error = await deleteResponse.json();
                alert(error.message);
            }
        };
        
        li.appendChild(deleteButton);
        expenseList.appendChild(li);
    });
}

// Handle Purchase Premium Membership
document.getElementById('purchase-premium')?.addEventListener('click', async function () {
    const premiumAmount = 999; // Set the premium membership amount in INR (in paise, it's 99900 for ₹999)
    
    const response = await fetch('/api/payment/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: premiumAmount })
    });

    if (!response.ok) {
        const error = await response.json();
        alert(error.message);
        return;
    }

    const order = await response.json();
    console.log('Premium Membership Order created:', order);

    // Initialize Razorpay for Premium Membership
    const options = {
        key: 'rzp_test_Zg354u0qZFNwDp', // Your Razorpay Key ID
        amount: order.amount, // Amount in paise
        currency: order.currency,
        name: "Expense Tracker",
        description: "Premium Membership Purchase",
        order_id: order.id, // Order ID created by Razorpay
        handler: function (response) {
            alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
            localStorage.setItem('isPremium', 'true'); // Set premium status in localStorage
            updatePremiumStatus(); // Update the UI to reflect premium status
        },
        prefill: {
            name: localStorage.getItem('userName') || "Your Name", // Pre-fill with user's name
            email: localStorage.getItem('userEmail') || "your_email@example.com", // Pre-fill with user's email
            contact: "9999999999" // You can also pre-fill with user's contact if available
        },
        theme: {
            color: "#F37254"
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
});

// Call this function on page load
if (document.getElementById('expense-list')) {
    loadExpenses();
    updatePremiumStatus(); // Check premium status on load
}
checkLogin(); // Check if logged in when accessing the expense tracker
