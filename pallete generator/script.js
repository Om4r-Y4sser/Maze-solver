const generateBtn = document.getElementById("generate-btn");
const paletteContainer = document.querySelector(".palette-container");

generateBtn.addEventListener("click", generatePalette);

paletteContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("copy-btn")) {
    const hexValue = e.target.previousElementSibling.textContent;

    navigator.clipboard
      .writeText(hexValue)
      .then(() => showCopySuccess(e.target))
      .catch((err) => console.log(err));
  } else if (e.target.classList.contains("color")) {
    const hexValue =
      e.target.nextElementSibling.querySelector(".hex-value").textContent;
    navigator.clipboard
      .writeText(hexValue)
      .then(() =>
        showCopySuccess(
          e.target.nextElementSibling.querySelector(".copy-btn")
        )
      )
      .catch((err) => console.log(err));
  }
});

function showCopySuccess(element) {
  element.classList.remove("far", "fa-copy");
  element.classList.add("fas", "fa-check");
  element.style.color = "#48bb78";

  setTimeout(() => {
    element.classList.remove("fas", "fa-check");
    element.classList.add("far", "fa-copy");
    element.style.color = "";
  }, 1500);
}

function generatePalette() {
  const colors = [];

  for (let i = 0; i < 5; i++) {
    colors.push(generateRandomColor());
  }

  updatePaletteDisplay(colors);
}

function generateRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function updatePaletteDisplay(colors) {
  const colorBoxes = document.querySelectorAll(".color-box");

  colorBoxes.forEach((box, index) => {
    const color = colors[index];
    const colorDiv = box.querySelector(".color");
    const hexValue = box.querySelector(".hex-value");

    colorDiv.style.backgroundColor = color;
    hexValue.textContent = color;

    
    box.style.animation = "none";
    void box.offsetWidth; 
    box.style.animation = "popIn 0.6s ease";
  });

  const h1 = document.querySelector("h1");
  const btn = document.getElementById("generate-btn");

  if (colors.length >= 2) {
    const gradient = `linear-gradient(90deg, ${colors[0]}, ${colors[1]})`;
    h1.style.background = gradient;
    h1.style.webkitBackgroundClip = "text";
    h1.style.webkitTextFillColor = "transparent";

    btn.style.background = gradient;
  }

  
const body = document.querySelector("body");
const bgGradient = `linear-gradient(135deg, ${colors[0]}, ${colors[colors.length - 1]})`;

body.style.setProperty("--dynamic-gradient", bgGradient);

}
