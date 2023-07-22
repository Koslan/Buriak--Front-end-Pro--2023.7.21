function formatTime(number) {
  return number < 10 ? '0' + number : number;
}

var countDownDate = new Date("Jul 23, 2023 12:00:00").getTime();

var countdownFunction = setInterval(function() {

  var now = new Date().getTime();
  var timeLeft = countDownDate - now;

  var days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  var hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  document.getElementById("countdown").innerHTML = "Час до завантаження дз: " + formatTime(days) + " днів " + formatTime(hours) + " годин " 
  + formatTime(minutes) + " хвилин " + formatTime(seconds) + " секунд";

  if (timeLeft < 0) {
      clearInterval(countdownFunction);
      document.getElementById("countdown").innerHTML = "Час вийшов";
  }
}, 1000);