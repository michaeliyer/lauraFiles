// Global variables
let cocktails = [];
let editingId = null;
let deleteId = null;
let expandedCardId = null;
let isAdminMode = false;
const ADMIN_PASSWORD = "teabag";

// DOM elements
const cocktailForm = document.getElementById("cocktail-form");
const cocktailsList = document.getElementById("cocktails-list");
const searchInput = document.getElementById("search-input");
const loading = document.getElementById("loading");
const noCocktails = document.getElementById("no-cocktails");
const modal = document.getElementById("modal");
const deleteCocktailName = document.getElementById("delete-cocktail-name");
const confirmDeleteBtn = document.getElementById("confirm-delete");
const cancelDeleteBtn = document.getElementById("cancel-delete");
const cancelBtn = document.getElementById("cancel-btn");
const formTitle = document.getElementById("form-title");

// Admin elements
const adminModal = document.getElementById("admin-modal");
const adminPasswordInput = document.getElementById("admin-password");
const adminLoginBtn = document.getElementById("admin-login-btn");
const adminCancelBtn = document.getElementById("admin-cancel-btn");
const adminError = document.getElementById("admin-error");
const showFormBtn = document.getElementById("show-form-btn");
const adminStatus = document.getElementById("admin-status");
const exitAdminBtn = document.getElementById("exit-admin-btn");

// API base URL
const API_BASE = "https://franky-app-ix96j.ondigitalocean.app/api/bevvies";

// Image upload variables
const fileInput = document.getElementById("theJpegFile");
const imageUrlInput = document.getElementById("theJpeg");
const imagePreview = document.getElementById("image-upload-preview");
let uploadedImagePath = null;

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  loadCocktails();
  setupEventListeners();
  setupImageUpload();
  updateAdminButton(); // Initialize admin button state

  // Add this after your existing setupImageUpload function

  // Add this function after your existing setupImageUpload function
  function setupCloudinaryWidget() {
    // Check if Cloudinary is available
    if (typeof cloudinary === "undefined") {
      console.error("Cloudinary widget not loaded");
      return;
    }

    // Create upload widget with more features
    const widget = cloudinary.createUploadWidget(
      {
        cloudName: "dqjhgnivi",
        uploadPreset: "cocktail_uploads",
        sources: [
          "local", // File picker
          "url", // Upload from URL
          "camera", // Camera capture (mobile)
          "image_search", // Search images (requires API key)
          "facebook", // Facebook photos
          "dropbox", // Dropbox
          "google_drive", // Google Drive
          "instagram", // Instagram
        ],
        multiple: false,
        resourceType: "image",
        clientAllowedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
        maxFileSize: 10000000, // 10MB
        folder: "cocktails",
        cropping: true, // Enable cropping
        croppingAspectRatio: 1.0, // Square crop
        showAdvancedOptions: true,
        showInsecurePreview: true,
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto" },
        ],
        theme: "minimal",
        styles: {
          palette: {
            window: "#ffffff",
            sourceBg: "#f4f4f5",
            windowBorder: "#90a0b3",
            tabIcon: "#0078ff",
            inactiveTabIcon: "#69778a",
            menuIcons: "#0078ff",
            link: "#0078ff",
            action: "#0078ff",
            inProgress: "#0078ff",
            complete: "#20b832",
            error: "#ea2727",
            textDark: "#000000",
            textLight: "#ffffff",
          },
        },
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          console.log("Upload successful:", result.info);
          uploadedImagePath = result.info.secure_url;

          // Update preview with more info
          imagePreview.innerHTML = `
          <div style="border: 1px solid #ddd; padding: 10px; border-radius: 8px; background: #f9f9f9;">
            <img src="${
              result.info.secure_url
            }" alt="Preview" style="max-width:120px;max-height:80px;border-radius:8px;box-shadow:0 2px 8px #ccc;">
            <div style="margin-top: 8px;">
              <div style="color:green;font-size:12px;">✓ Upload successful</div>
              <div style="color:#666;font-size:11px;">Size: ${Math.round(
                result.info.bytes / 1024
              )}KB</div>
              <div style="color:#666;font-size:11px;">Format: ${result.info.format.toUpperCase()}</div>
            </div>
          </div>
        `;
        }

        if (error) {
          console.error("Upload error:", error);
          imagePreview.innerHTML = `<div style="color:red;padding:10px;border:1px solid #ff6b6b;border-radius:4px;background:#ffe0e0;">Upload failed: ${
            error.message || "Please try again"
          }</div>`;
        }
      }
    );

    // Add click handler to open widget
    const uploadButton = document.getElementById("cloudinary-upload-btn");
    if (uploadButton) {
      uploadButton.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Opening Cloudinary widget...");
        widget.open();
      });
    } else {
      console.error("Cloudinary upload button not found");
    }
  }

  // Update your DOMContentLoaded function to include setupCloudinaryWidget
  document.addEventListener("DOMContentLoaded", function () {
    loadCocktails();
    setupEventListeners();
    setupImageUpload();
    setupCloudinaryWidget(); // Add this line
    updateAdminButton(); // Initialize admin button state
    // Hide form by default
    document.getElementById("form-section").style.display = "none";
    // Setup image modal events
    setupImageModal();
    // View changer logic
    setupViewChanger();
  });

  // Hide form by default
  document.getElementById("form-section").style.display = "none";
  // Setup image modal events
  setupImageModal();
  // View changer logic
  setupViewChanger();
});

function setupImageModal() {
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("image-modal-img");
  const closeBtn = document.getElementById("image-modal-close");

  // Open modal on image click (event delegation)
  document
    .getElementById("cocktails-list")
    .addEventListener("click", function (e) {
      const img = e.target.closest(".cocktail-image");
      if (img) {
        e.stopPropagation();
        modalImg.src = img.src;
        modal.classList.add("show");
        return;
      }
    });

  // Close modal on close button
  closeBtn.addEventListener("click", function () {
    modal.classList.remove("show");
    modalImg.src = "";
  });

  // Close modal on click outside image
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.classList.remove("show");
      modalImg.src = "";
    }
  });

  // ESC key closes modal
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("show")) {
      modal.classList.remove("show");
      modalImg.src = "";
    }
  });
}

function setupViewChanger() {
  const grid = document.getElementById("cocktails-list");
  const viewBtns = [
    { id: "view-grid", class: "grid" },
    { id: "view-masonry", class: "masonry" },
    { id: "view-oblique", class: "oblique" },
  ];

  function setGridView(view) {
    grid.classList.remove("grid", "masonry", "oblique");
    grid.classList.add(view);
    viewBtns.forEach((btn) => {
      const el = document.getElementById(btn.id);
      if (btn.class === view) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });
  }

  viewBtns.forEach((btn) => {
    const el = document.getElementById(btn.id);
    if (el) {
      el.addEventListener("click", function (e) {
        setGridView(btn.class);
      });
    }
  });

  // Set default view
  setGridView("grid");
}

// Setup event listeners
function setupEventListeners() {
  // Form submission
  cocktailForm.addEventListener("submit", handleFormSubmit);

  // Search functionality
  searchInput.addEventListener("input", handleSearch);

  // Modal events
  confirmDeleteBtn.addEventListener("click", handleConfirmDelete);
  cancelDeleteBtn.addEventListener("click", closeModal);

  // Cancel edit
  cancelBtn.addEventListener("click", cancelEdit);

  // Close modal when clicking outside
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Admin modal events
  adminLoginBtn.addEventListener("click", handleAdminLogin);
  adminCancelBtn.addEventListener("click", closeAdminModal);
  exitAdminBtn.addEventListener("click", exitAdminMode);

  // Close admin modal when clicking outside
  adminModal.addEventListener("click", function (e) {
    if (e.target === adminModal) {
      closeAdminModal();
    }
  });

  // Admin password input - handle Enter key
  adminPasswordInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      handleAdminLogin();
    }
  });

  // Floating add button - now triggers admin check
  showFormBtn.addEventListener("click", function (e) {
    e.preventDefault();
    if (isAdminMode) {
      showForm();
    } else {
      showAdminModal();
    }
  });

  // Close form button
  document
    .getElementById("close-form-btn")
    .addEventListener("click", function (e) {
      e.preventDefault();
      hideForm();
    });

  // Also hide form on cancel
  cancelBtn.addEventListener("click", function () {
    hideForm();
  });
}

// Setup image upload functionality
function setupImageUpload() {
  if (fileInput) {
    fileInput.addEventListener("change", async function (e) {
      const file = fileInput.files[0];
      if (!file) return;

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        imagePreview.innerHTML =
          '<div style="color:red;">Please select a valid image file (JPEG, PNG, GIF, or WebP)</div>';
        return;
      }

      // Validate file size (10MB Cloudinary limit)
      if (file.size > 10 * 1024 * 1024) {
        imagePreview.innerHTML =
          '<div style="color:red;">File size must be less than 10MB</div>';
        return;
      }

      imagePreview.innerHTML =
        '<div style="color:blue;">Uploading to Cloudinary...</div>';
      uploadedImagePath = null;

      // Show preview
      const reader = new FileReader();
      reader.onload = function (ev) {
        imagePreview.innerHTML = `<img src="${ev.target.result}" alt="Preview" style="max-width:120px;max-height:80px;border-radius:8px;box-shadow:0 2px 8px #ccc;">`;
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "cocktail_uploads"); // Make sure this preset exists

      try {
        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dqjhgnivi/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();

        if (response.ok && data.secure_url) {
          uploadedImagePath = data.secure_url;
          imagePreview.innerHTML = `
            <img src="${data.secure_url}" alt="Preview" style="max-width:120px;max-height:80px;border-radius:8px;box-shadow:0 2px 8px #ccc;">
            <div style="color:green;font-size:12px;">✓ Upload successful</div>
          `;
        } else {
          console.error("Cloudinary error:", data);
          imagePreview.innerHTML = `<div style='color:red;'>Upload failed: ${
            data.error?.message || "Please check your Cloudinary settings"
          }</div>`;
        }
      } catch (err) {
        console.error("Upload error:", err);
        imagePreview.innerHTML =
          '<div style="color:red;">Upload failed. Please try again.</div>';
      }
    });
  }
}

function showForm() {
  const formSection = document.getElementById("form-section");
  formSection.style.display = "block";
  formSection.classList.add("modal-edit");
  document.getElementById("show-form-btn").style.display = "none";
}

function hideForm() {
  const formSection = document.getElementById("form-section");
  formSection.style.display = "none";
  formSection.classList.remove("modal-edit");
  document.getElementById("show-form-btn").style.display = "flex";
  resetForm();
}

// Admin functions
function showAdminModal() {
  adminModal.style.display = "flex";
  adminPasswordInput.value = "";
  adminError.style.display = "none";
  adminPasswordInput.focus();
}

function closeAdminModal() {
  adminModal.style.display = "none";
  adminPasswordInput.value = "";
  adminError.style.display = "none";
}

function handleAdminLogin() {
  const password = adminPasswordInput.value.trim();

  if (password === ADMIN_PASSWORD) {
    isAdminMode = true;
    closeAdminModal();
    showMessage("Admin mode activated! You can now edit cocktails.", "success");
    displayCocktails(cocktails); // Refresh display to show admin controls
    updateAdminButton();

    // Check if there's a pending edit action
    if (window.pendingEditId) {
      const editId = window.pendingEditId;
      window.pendingEditId = null; // Clear the pending action
      // Small delay to ensure admin mode is fully activated
      setTimeout(() => {
        performEditCocktail(editId);
      }, 100);
    }

    // Check if there's a pending delete action
    if (window.pendingDeleteId) {
      const deleteId = window.pendingDeleteId;
      const deleteName = window.pendingDeleteName;
      window.pendingDeleteId = null; // Clear the pending action
      window.pendingDeleteName = null;
      // Small delay to ensure admin mode is fully activated
      setTimeout(() => {
        performDeleteCocktail(deleteId, deleteName);
      }, 100);
    }
  } else {
    adminError.textContent = "Incorrect password. Please try again.";
    adminError.style.display = "block";
    adminPasswordInput.value = "";
    adminPasswordInput.focus();
  }
}

function exitAdminMode() {
  isAdminMode = false;
  hideForm();
  displayCocktails(cocktails); // Refresh display to hide admin controls
  updateAdminButton();
  showMessage("Admin mode deactivated.", "info");
}

function updateAdminButton() {
  if (isAdminMode) {
    showFormBtn.innerHTML = '<i class="fas fa-plus"></i>';
    showFormBtn.title = "Add New Cocktail (Admin Mode)";
    showFormBtn.classList.add("admin-active");
    adminStatus.style.display = "flex";
  } else {
    showFormBtn.innerHTML = '<i class="fas fa-plus"></i>';
    showFormBtn.title = "Add New Cocktail (Requires Admin)";
    showFormBtn.classList.remove("admin-active");
    adminStatus.style.display = "none";
  }
}

// Load all cocktails
async function loadCocktails() {
  try {
    showLoading(true);
    const response = await fetch(API_BASE);

    if (!response.ok) {
      throw new Error("Failed to load cocktails");
    }

    cocktails = await response.json();
    displayCocktails(cocktails);
    checkBrokenImages(); // Check for broken images
  } catch (error) {
    console.error("Error loading cocktails:", error);
    showMessage("Error loading cocktails", "error");
  } finally {
    showLoading(false);
  }
}

// Check for broken images
function checkBrokenImages() {
  const brokenImages = cocktails.filter((cocktail) => {
    return (
      cocktail.theJpeg &&
      !cocktail.theJpeg.includes("cloudinary.com") &&
      !cocktail.theJpeg.startsWith("http")
    );
  });

  if (brokenImages.length > 0) {
    console.log(
      `Found ${brokenImages.length} cocktails with potentially broken images:`
    );
    brokenImages.forEach((cocktail) => {
      console.log(`- ${cocktail.theCock}: ${cocktail.theJpeg}`);
    });
  }
}

// Display cocktails in the grid
function displayCocktails(cocktailsToShow) {
  if (cocktailsToShow.length === 0) {
    cocktailsList.innerHTML = "";
    noCocktails.style.display = "block";
    return;
  }

  noCocktails.style.display = "none";

  const cocktailsHTML = cocktailsToShow
    .map((cocktail) => {
      const isExpanded = expandedCardId === cocktail._id;
      return `
        <div class="cocktail-card${isExpanded ? " expanded" : ""}" data-id="${
        cocktail._id
      }">
            ${
              cocktail.theJpeg
                ? `<img src="${escapeHtml(cocktail.theJpeg)}" alt="${escapeHtml(
                    cocktail.theCock
                  )}" class="cocktail-image" onerror="this.style.display='none'">`
                : ""
            }
            <div class="cocktail-header" onclick="toggleCardExpand(event, '${
              cocktail._id
            }')" style="cursor:pointer;">
                <div>
                    <h3 class="cocktail-name">${escapeHtml(
                      cocktail.theCock
                    )}</h3>
                </div>
                <div class="cocktail-actions">
                    ${
                      isAdminMode
                        ? `
                        <button class="btn btn-edit btn-sm" onclick="editCocktail('${
                          cocktail._id
                        }');event.stopPropagation();" title="Edit Cocktail">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-delete btn-sm" onclick="deleteCocktail('${
                          cocktail._id
                        }', '${escapeHtml(
                            cocktail.theCock
                          )}');event.stopPropagation();" title="Delete Cocktail">
                            <i class="fas fa-trash"></i>
                        </button>
                    `
                        : ""
                    }
                    ${
                      isExpanded
                        ? `<button class="btn btn-secondary btn-collapse" onclick="collapseCard(event, '${cocktail._id}')"><i class="fas fa-times"></i></button>`
                        : `<button class="btn btn-primary btn-expand"><i class="fas fa-plus"></i></button>`
                    }
                </div>
            </div>
            <div class="cocktail-details" style="display:${
              isExpanded ? "block" : "none"
            };">
                <div class="cocktail-ingredients">
                    <h4>Ingredients</h4>
                    <p>${escapeHtml(cocktail.theIngredients)}</p>
                </div>
                <div class="cocktail-recipe">
                    <h4>Recipe</h4>
                    <p>${escapeHtml(cocktail.theRecipe)}</p>
                </div>
                ${
                  cocktail.theComment
                    ? `<div class="cocktail-comment">${escapeHtml(
                        cocktail.theComment
                      )}</div>`
                    : ""
                }
            </div>
        </div>
        `;
    })
    .join("");

  cocktailsList.innerHTML = cocktailsHTML;
}

// Expand/collapse logic
window.toggleCardExpand = function (event, id) {
  // Only expand if not already expanded
  if (expandedCardId !== id) {
    expandedCardId = id;
  } else {
    expandedCardId = null;
  }
  displayCocktails(cocktails);
  event.stopPropagation();
};

window.collapseCard = function (event, id) {
  expandedCardId = null;
  displayCocktails(cocktails);
  event.stopPropagation();
};

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(cocktailForm);
  let theJpegValue = uploadedImagePath || formData.get("theJpeg") || null;
  const cocktailData = {
    theCock: formData.get("theCock"),
    theIngredients: formData.get("theIngredients"),
    theRecipe: formData.get("theRecipe"),
    theJpeg: theJpegValue,
    theComment: formData.get("theComment") || null,
  };

  try {
    if (editingId) {
      // Update existing cocktail
      await updateCocktail(editingId, cocktailData);
      showMessage("Cocktail updated successfully!", "success");
    } else {
      // Create new cocktail
      await createCocktail(cocktailData);
      showMessage("Cocktail added successfully!", "success");
    }

    resetForm();
    await loadCocktails();
    hideForm(); // Hide form after submit
  } catch (error) {
    console.error("Error saving cocktail:", error);
    showMessage("Error saving cocktail", "error");
  }
}

// Create new cocktail
async function createCocktail(cocktailData) {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cocktailData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create cocktail");
  }

  return await response.json();
}

// Update existing cocktail
async function updateCocktail(id, cocktailData) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cocktailData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update cocktail");
  }

  return await response.json();
}

// Edit cocktail
function editCocktail(id) {
  // Check if user is in admin mode
  if (!isAdminMode) {
    // Store the cocktail ID to edit after authentication
    window.pendingEditId = id;
    showAdminModal();
    return;
  }

  // User is already authenticated, proceed with edit
  performEditCocktail(id);
}

function performEditCocktail(id) {
  const cocktail = cocktails.find((c) => c._id === id);
  if (!cocktail) return;

  editingId = id;
  formTitle.textContent = "Edit Cocktail";
  cancelBtn.style.display = "inline-flex";

  // Populate form
  document.getElementById("cocktail-id").value = cocktail._id;
  document.getElementById("theCock").value = cocktail.theCock;
  document.getElementById("theIngredients").value = cocktail.theIngredients;
  document.getElementById("theRecipe").value = cocktail.theRecipe;
  document.getElementById("theJpeg").value = cocktail.theJpeg || "";
  document.getElementById("theComment").value = cocktail.theComment || "";
  // this is prob ok
  // Show existing image in preview if it exists
  if (cocktail.theJpeg) {
    // Check if it's a Cloudinary URL
    if (cocktail.theJpeg.includes("cloudinary.com")) {
      imagePreview.innerHTML = `
        <img src="${cocktail.theJpeg}" alt="Current image" style="max-width:120px;max-height:80px;border-radius:8px;box-shadow:0 2px 8px #ccc;">
        <div style="color:green;font-size:12px;">Current image</div>
      `;
      uploadedImagePath = cocktail.theJpeg;
    } else {
      // It's a local/broken image
      imagePreview.innerHTML = `
        <div style="color:orange;font-size:12px;">⚠️ Current image may not be working. Please upload a new one.</div>
      `;
    }
  } else {
    imagePreview.innerHTML = "";
  }
  // stop here

  // Show the form section (modal)
  const formSection = document.getElementById("form-section");
  formSection.style.display = "block";
  formSection.classList.add("modal-edit");
  document.getElementById("show-form-btn").style.display = "none";

  // Scroll to form
  formSection.scrollIntoView({ behavior: "smooth" });
}

// Cancel edit
function cancelEdit() {
  editingId = null;
  resetForm();
}

// Reset form
function resetForm() {
  cocktailForm.reset();
  editingId = null;
  uploadedImagePath = null;
  formTitle.textContent = "Add New Cocktail";
  cancelBtn.style.display = "none";
  document.getElementById("cocktail-id").value = "";

  // Clear image preview
  if (imagePreview) {
    imagePreview.innerHTML = "";
  }

  // Clear file input
  if (fileInput) {
    fileInput.value = "";
  }
}

// Delete cocktail
function deleteCocktail(id, name) {
  // Check if user is in admin mode
  if (!isAdminMode) {
    // Store the cocktail info to delete after authentication
    window.pendingDeleteId = id;
    window.pendingDeleteName = name;
    showAdminModal();
    return;
  }

  // User is already authenticated, proceed with delete
  performDeleteCocktail(id, name);
}

function performDeleteCocktail(id, name) {
  deleteId = id;
  deleteCocktailName.textContent = name;
  modal.style.display = "block";
}

// Handle confirm delete
async function handleConfirmDelete() {
  if (!deleteId) return;

  try {
    const response = await fetch(`${API_BASE}/${deleteId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete cocktail");
    }

    showMessage("Cocktail deleted successfully!", "success");
    await loadCocktails();
  } catch (error) {
    console.error("Error deleting cocktail:", error);
    showMessage("Error deleting cocktail", "error");
  } finally {
    closeModal();
    deleteId = null;
  }
}

// Close modal
function closeModal() {
  modal.style.display = "none";
  deleteId = null;
}

// Handle search
function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  if (!searchTerm) {
    displayCocktails(cocktails);
    return;
  }

  const filteredCocktails = cocktails.filter(
    (cocktail) =>
      cocktail.theCock.toLowerCase().includes(searchTerm) ||
      cocktail.theIngredients.toLowerCase().includes(searchTerm) ||
      cocktail.theRecipe.toLowerCase().includes(searchTerm) ||
      (cocktail.theComment &&
        cocktail.theComment.toLowerCase().includes(searchTerm))
  );

  displayCocktails(filteredCocktails);
}

// Show/hide loading state
function showLoading(show) {
  loading.style.display = show ? "block" : "none";
  if (show) {
    noCocktails.style.display = "none";
  }
}

// Show message
function showMessage(message, type = "success") {
  // Remove existing messages
  const existingMessages = document.querySelectorAll(".message");
  existingMessages.forEach((msg) => msg.remove());

  // Create new message
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;

  // Insert at the top of the main content
  const mainContent = document.querySelector(".main-content");
  mainContent.insertBefore(messageDiv, mainContent.firstChild);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Add this temporarily to test the button
document.addEventListener("DOMContentLoaded", function () {
  // ... your existing code ...

  // Test button click
  const testButton = document.getElementById("cloudinary-upload-btn");
  if (testButton) {
    testButton.addEventListener("click", function () {
      console.log("Button clicked!");
      alert("Button works!");
    });
  } else {
    console.error("Button not found!");
  }
});
