const inputNumber = document.getElementById("input-number")
const inputBtn = document.querySelector("#input-btn");
const styleRoot = document.querySelector(":root");

// inputNumber.addEventListener("input", function(e) {
//     if (this.value.length > this.maxLength) {
//         this.value = this.value.slice(0, this.maxLength);
//     }
// })

// inputNumber.addEventListener("keypress", function(e) {
//     if (e.key == "Enter") {
//         startSetNumbers();
//     }
// })

// inputBtn.addEventListener("click", startSetNumbers);

function startSetNumbers(value) {
    if (value) {
        if (value.length < 3) {
            value = value.padStart(3, 0);
        }
        value = Array.from(value);
    } else {
        value = Array.from("000")
    }
    setNumberPercent(value);
}

function setNumberPercent(numbers) {
    console.log("working")
    let numberBottom;
    for (i in numbers) {
        switch (numbers[i]) {
            case "0":
                numberBottom = "470%";
                break;
            case "1":
                numberBottom = "365%";
                break;
            case "2":
                numberBottom = "260%";
                break;
            case "3":
                numberBottom = "155%";
                break;
            case "4":
                numberBottom = "50%";
                break;
            case "5":
                numberBottom = "-55%";
                break;
            case "6":
                numberBottom = "-160%";
                break;
            case "7":
                numberBottom = "-265%";
                break;
            case "8":
                numberBottom = "-370%";
                break;
            case "9":
                numberBottom = "-475%";
                break;
        }
        styleRoot.style.setProperty(`--bottom-${i}`, numberBottom);
    }
}

setNumberPercent(Array.from("000"));