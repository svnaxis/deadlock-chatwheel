document.addEventListener("DOMContentLoaded", () => {
  const phrases = {
    1: "Going In",
    2: "Need Help!",
    3: "Yes!",
    4: "Thanks",
    5: "Retreat",
    6: "Stay Together",
    12: "Be right back!",
    17: "No",
    18: "Good Job!",
    23: "On my Way",
    29: "Spotted...",
    30: "Careful...",
    31: "Missing...",
    32: "Heal Please",
    33: "I can heal you",
    34: "What's the plan?",
    44: "You're Welcome",
    45: "Sorry",
    46: "Going to Shop",
    47: "Come with Me!",
    48: "Going to Gank",
    50: "Cover me!",
    51: "Never mind",
    52: "I'm not ready for a teamfight",
    53: "We need to press the advantage!",
    54: "Let's hide here",
    58: "I'll flank 'em",
    60: "I'm leaving the area!",
    61: "Going to farm",
    62: "Let's steal their farm",
    63: "Going to Rat",
    64: "Let's split push",
    65: "I'm leaving",
    66: "Don't overextend!",
  };

  const wheelContainer = document.querySelector(".wheel-container");
  const optionsHint = document.querySelector(".options-hint");
  const optionsList = document.querySelector(".options-list");
  const optionsSection = document.querySelector(".options-section");
  const searchInput = document.querySelector(".options-search input");
  const commandOutput = document.querySelector(".command-output");
  const commandCopy = document.querySelector(".command-copy");
  const commandReset = document.querySelector(".command-reset");

  const WHEEL_SELECTIONS_STORAGE_KEY = "chatwheel";

  const wheelSlots = [];
  const numWheelSlots = 8;
  let selectedWheelSlotIndex = null;
  const wheelSelections = Array(numWheelSlots).fill(null); // To store {id, text} for each slot

  // Function to save wheel selections to localStorage
  function saveWheelSelections() {
    localStorage.setItem(WHEEL_SELECTIONS_STORAGE_KEY, JSON.stringify(wheelSelections));
  }

  // Function to load wheel selections from localStorage
  function loadWheelSelections() {
    const storedSelections = localStorage.getItem(WHEEL_SELECTIONS_STORAGE_KEY);
    if (storedSelections) {
      try {
        const parsedSelections = JSON.parse(storedSelections);
        if (Array.isArray(parsedSelections) && parsedSelections.length === numWheelSlots) {
          parsedSelections.forEach((selection, index) => {
            if (selection && selection.id && selection.text) {
              wheelSelections[index] = selection;
              if (wheelSlots[index]) {
                wheelSlots[index].textContent = selection.text;
                wheelSlots[index].dataset.id = selection.id;
              }
            }
          });
          return true; // Indicate that selections were loaded
        }
      } catch (e) {
        console.error("Error parsing stored wheel selections:", e);
        // Clear corrupted data
        localStorage.removeItem(WHEEL_SELECTIONS_STORAGE_KEY);
      }
    }
    return false; // Indicate no valid selections were loaded
  }

  // Populate options list
  Object.entries(phrases)
    .sort(([idA], [idB]) => parseInt(idA) - parseInt(idB))
    .forEach(([id, text]) => {
      const listItem = document.createElement("li");
      listItem.textContent = text;
      listItem.dataset.id = id;
      listItem.addEventListener("click", () => {
        if (selectedWheelSlotIndex !== null) {
          const selectedSlot = wheelSlots[selectedWheelSlotIndex];
          selectedSlot.textContent = text;
          selectedSlot.dataset.id = id;
          // Store the selection
          wheelSelections[selectedWheelSlotIndex] = { id, text };
          // Update the options list to show this as selected for the current slot
          document.querySelectorAll(".options-list li.is-selected").forEach((opt) => opt.classList.remove("is-selected"));
          listItem.classList.add("is-selected");
          updateCommandOutput(); // Update command when an option is selected
          saveWheelSelections(); // Save after updating
        }
      });
      optionsList.appendChild(listItem);
    });

  // Add search functionality
  function filterOptions(searchTerm) {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    const listItems = optionsList.querySelectorAll("li");

    listItems.forEach((item) => {
      const text = item.textContent.toLowerCase();
      if (text.includes(normalizedSearch)) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });
  }

  // Add event listener for search input
  searchInput.addEventListener("input", (e) => {
    filterOptions(e.target.value);
  });

  // Clear search when section becomes inactive
  function clearSearch() {
    searchInput.value = "";
    filterOptions("");
  }

  // Get wheel slots (already in DOM)
  // Ensure they are in the correct order based on data-index
  const slotElements = Array.from(wheelContainer.querySelectorAll(".wheel-slot"));
  slotElements.sort((a, b) => parseInt(a.dataset.index) - parseInt(b.dataset.index));
  wheelSlots.push(...slotElements);

  // Add event listeners to the new static slots
  wheelSlots.forEach((slot, index) => {
    slot.addEventListener("click", () => {
      const slotIndex = parseInt(slot.dataset.index);
      // If the clicked slot is already selected
      if (slot.classList.contains("selected")) {
        slot.classList.remove("selected");
        selectedWheelSlotIndex = null;
        // Remove 'is-selected' from all list items
        document.querySelectorAll(".options-list li.is-selected").forEach((opt) => opt.classList.remove("is-selected"));
        clearSearch(); // Clear search when slot is deselected
        if (optionsSection) {
          optionsSection.prepend(optionsHint);
          optionsSection.classList.remove("is-active");
        }
      } else {
        // Deselect previously selected slot (if any)
        wheelSlots.forEach((s) => s.classList.remove("selected"));
        // Select current slot
        slot.classList.add("selected");
        selectedWheelSlotIndex = slotIndex;

        // Highlight the corresponding item in the options list if it's already set
        document.querySelectorAll(".options-list li.is-selected").forEach((opt) => opt.classList.remove("is-selected"));
        const currentSelection = wheelSelections[selectedWheelSlotIndex];
        if (currentSelection) {
          const optionListItem = optionsList.querySelector(`li[data-id='${currentSelection.id}']`);
          if (optionListItem) {
            optionListItem.classList.add("is-selected");
            optionListItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }
        if (optionsSection) {
          optionsSection.classList.add("is-active");
          optionsHint.remove();
        }
      }
    });
  });

  function updateCommandOutput() {
    let command = "";
    wheelSelections.forEach((selection, index) => {
      if (selection) {
        // The command format is `ping_wheel_phrase_INDEX ID;`
        // Assuming the data-index on the slot corresponds to the INDEX in the command.
        command += `ping_wheel_phrase_${index} ${selection.id};`;
      }
    });
    commandOutput.value = command.trim();
  }

  commandCopy.addEventListener("click", () => {
    if (commandOutput.value) {
      navigator.clipboard
        .writeText(commandOutput.value)
        .then(() => {
          // Optional: Show a temporary message like "Copied!"
          const originalText = commandCopy.textContent;
          commandCopy.textContent = "Command copied!";
          setTimeout(() => {
            commandCopy.textContent = originalText;
          }, 1500);
        })
        .catch((err) => {
          console.error("Failed to copy command: ", err);
          // Optional: Show an error message to the user
        });
    }
  });

  // Load selections first. If not found, then pre-fill from the example image.
  const selectionsLoaded = loadWheelSelections();

  // Pre-fill from the example image if desired and nothing was loaded from localStorage
  if (!selectionsLoaded) {
    resetToDefault();
  }
  updateCommandOutput();

  // Function to reset the wheel to default
  function resetToDefault() {
    const imageWheelState = {
      0: 1, // Top (ping_wheel_phrase_0)
      1: 2, // Right 1 (ping_wheel_phrase_1)
      2: 4, // Right 2 (ping_wheel_phrase_2)
      3: 34, // Right 3 (ping_wheel_phrase_3)
      4: 18, // Bottom (ping_wheel_phrase_4)
      5: 5, // Left 3 (ping_wheel_phrase_5)
      6: 42, // Left 2 (ping_wheel_phrase_6)
      7: 6, // Left 1 (ping_wheel_phrase_7)
    };

    Object.entries(imageWheelState).forEach(([slotIdx, phraseId]) => {
      const slotIndex = parseInt(slotIdx);
      if (phrases[phraseId]) {
        wheelSlots[slotIndex].textContent = phrases[phraseId];
        wheelSlots[slotIndex].dataset.id = phraseId;
        wheelSelections[slotIndex] = { id: phraseId, text: phrases[phraseId] };
      }
    });
    saveWheelSelections(); // Save the default selections
    updateCommandOutput(); // Update the command output
    // Optionally, visually update the options list if a slot is selected
    if (selectedWheelSlotIndex !== null) {
      document.querySelectorAll(".options-list li.is-selected").forEach((opt) => opt.classList.remove("is-selected"));
      const currentSelection = wheelSelections[selectedWheelSlotIndex];
      if (currentSelection) {
        const optionListItem = optionsList.querySelector(`li[data-id='${currentSelection.id}']`);
        if (optionListItem) {
          optionListItem.classList.add("is-selected");
        }
      }
    }
  }

  // Event listener for the reset button
  commandReset.addEventListener("click", () => {
    resetToDefault();
  });
});
