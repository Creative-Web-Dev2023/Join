function displayNameColor(nameData, colorData, emblemData) {
  return `
    <div class="dropdown-item" data-name="${nameData}" onclick="toggleSelection(this)" data-selected="false">
      <div class="dropdown-label">
        <div class="circle" style="background-color: ${colorData};"><p>${emblemData}</p></div>
        <div class="chosenName">${nameData}</div>
      </div>
      <img src="/assets/img/img_add_task/checkbox.png" class="toggle-image" alt="Unselected" width="20" height="20">
    </div>
  `;
}
