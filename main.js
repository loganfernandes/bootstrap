const output = document.getElementById("output");
const input = document.getElementById("input");

input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const command = input.value;
    input.value = "";
    print("> " + command);
});

function print(text) {
    const line = document.createElement("div");
    line.textContent = text;
    output.appendChild(line);
}