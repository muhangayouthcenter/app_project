document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const remember = document.getElementById("remember").checked

    // Log form data
    console.log("Login attempt:", {
      email: email,
      password: "***hidden***",
      remember: remember,
    })

    // Validate email
    if (!isValidEmail(email)) {
      alert("Please enter a valid email address")
      return
    }

    // Validate password
    if (password.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }

    // Here you would normally send data to your server
    // For now, we'll just show a success message
    alert("Login successful! Email: " + email)

    // Reset form if not remembering
    if (!remember) {
      loginForm.reset()
    }
  })

  // Email validation helper
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Handle Google login button
  const googleButton = document.querySelector(".google-button")
  googleButton.addEventListener("click", () => {
    console.log("Google login clicked")
    alert("Google login would be implemented here")
  })

  // Handle forgot password link
  const forgotLink = document.querySelector(".forgot-link")
  forgotLink.addEventListener("click", (event) => {
    event.preventDefault()
    console.log("Forgot password clicked")
    alert("Password reset would be implemented here")
  })

  // Handle sign up link
  const signupLink = document.querySelector(".signup-link")
  signupLink.addEventListener("click", (event) => {
    event.preventDefault()
    console.log("Sign up clicked")
    alert("Sign up page would be shown here")
  })
})
