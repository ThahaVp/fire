
function submitSalesData() {

  const name = document.getElementById("n").value.trim().replace(/(^\w|\s\w)/g, m => m.toUpperCase())
  const area = document.getElementById("a").value.trim().replace(/(^\w|\s\w)/g, m => m.toUpperCase())
  const district = $('#d').val();
  const phone = document.getElementById("id").value.trim()
  const pass = document.getElementById("key").value.trim()
  const re_pass = document.getElementById("re_pass").value.trim()

  if (name != "" && area != "" && phone.length == 10
    && district != "x" && pass != "" && re_pass != "") {

    if (pass.length > 6) {
      if (pass == re_pass) {
        document.getElementById("error-text").innerHTML = "Please wait.."
        document.getElementById("submit-btn").value = "Submitting Data";
        document.getElementById("submit-btn").disabled = true;


        var xhr = new XMLHttpRequest();
        xhr.open("POST", 'http://localhost:3000/su/add-sales-user', true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function () {
          if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            var res = JSON.parse(this.response)
            console.log(res)
            if (res.status == 1) {
              window.open("/su/sales", "_self");
            }
            else {
              document.getElementById("submit-btn").value = "Done";
              document.getElementById("submit-btn").disabled = false;
              if (res.status == 0)
                document.getElementById("error-text").innerHTML = "Error white submitting"
              else if (res.status == -1)
                document.getElementById("error-text").innerHTML = "Phone Number is already registered"
              else if (res.status == -2) {
                document.getElementById("error-text").innerHTML = "Please Login again"
              }
            }
          }
        }

        xhr.send(
          "n=" + name +
          "&a=" + area +
          "&d=" + district +
          "&id=" + phone +
          "&key=" + pass +
          "&re_pass=" + re_pass 
        );
      }
      else {
        document.getElementById("error-text").innerHTML = "Password not matching"
      }
    }
    else {
      document.getElementById("error-text").innerHTML = "Password should be more than 6 letter"
    }
  }
  else {
    document.getElementById("error-text").innerHTML = "Please fill all the required fields"
  }

}


function showPassword() {
  var x = document.getElementById("passField");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

function showRePassword() {
  var x = document.getElementById("key");
  var xx = document.getElementById("re_pass");
  if (x.type === "password") {
    x.type = "text";
    xx.type = "text";
  } else {
    x.type = "password";
    xx.type = "password";
  }
}


