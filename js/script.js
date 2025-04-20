// DOMContent Loaded is used to manipulate and handle events and elements
document.addEventListener('DOMContentLoaded', function() {

    // import buttons
    const nextButtons = document.querySelectorAll('.next-btn');
    const prevButtons = document.querySelectorAll('.prev-btn');

    // import form and progress elements
    const progressSteps = document.querySelectorAll('.progress-section');
    const form = document.getElementById('travel-questionnaire');


    // import form elements
    const partnerCheckbox = document.getElementById('partner-checkbox');
    const childrenCheckbox = document.getElementById('children-checkbox');
    const friendsCheckbox = document.getElementById('friends-checkbox');
    const childrenCountDiv = document.getElementById('children-count-div');
    const friendsCountDiv = document.getElementById('friends-count-div');
    const childrenCount = document.getElementById('children-count');
    const friendsCount = document.getElementById('friends-count');
    const companionTravelersContainer = document.getElementById('companion-travelers-container');
    const activityLevelTypes = document.querySelectorAll('.activity-l-type');
    const accommodationTypes = document.querySelectorAll('.accommodation-type');
    const environmentTypes = document.querySelectorAll('.environment-type');
    const transportTypes = document.querySelectorAll('.transport-type');
    const destinationTypes = document.querySelectorAll('.destination-type');

    // import budget elements
    const budgetRange = document.getElementById('budget-range');
    const budgetDisplay = document.getElementById('budget-display');
  
    
    // nextbutton event listener
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {

            // get the current section and step
            const currentSection = document.querySelector('.form-section.active');
            const currentStep = parseInt(currentSection.id.split('-')[1]);

            // console data taken from the form for each step for debugging
            const formData = new FormData(form);
            const formValues = Object.fromEntries(formData);
            console.log(`Step ${currentStep} Data:`, formValues);

            // validate the current section if valid proceed to next page
            if (validateSection(currentSection)) {
                //removing active section to prompt the next section
                currentSection.classList.remove('active');
                //making next section active
                document.getElementById(`section-${currentStep + 1}`).classList.add('active');
                //updating the progress bar
                updateProgressBar(currentStep + 1);
            }
        });
    });

    //previous button event listener
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            // get the current section and step
            const currentSection = document.querySelector('.form-section.active');
            const currentStep = parseInt(currentSection.id.split('-')[1]);
            
            //removing active section to prompt the previous section and updating the progress bar
            currentSection.classList.remove('active');
            document.getElementById(`section-${currentStep - 1}`).classList.add('active');
            updateProgressBar(currentStep - 1);
        });
    });

    // companion travelers event listeners to execute the functions
    partnerCheckbox.addEventListener('change', handlePartnerChange);
    childrenCheckbox.addEventListener('change', handleChildrenChange);
    friendsCheckbox.addEventListener('change', handleFriendsChange);
    childrenCount.addEventListener('input', updateChildrenFields);
    friendsCount.addEventListener('input', updateFriendsFields);


    // Budget range slider event listener
    budgetRange.addEventListener('input', function() {
        budgetDisplay.textContent = '$' + parseInt(this.value).toLocaleString();
    });

    
    // Accommodation type selection event listener
    accommodationTypes.forEach(type => {
        type.addEventListener('change', function() {
            // hide all sub options
            document.querySelectorAll('.accommodation-option .sub-options').forEach(option => {
                option.style.display = 'none';
            });
            
            // show the selected sub options if available
            const subOptions = this.closest('.accommodation-option').querySelector('.sub-options');
            if (subOptions) {
                subOptions.style.display = 'block';
            }
        });
    });
    
    // Transport type selection event listener
    transportTypes.forEach(type => {
        type.addEventListener('change', function() {
            // get all sub options when selected
            const subOptions = this.closest('.transport-option').querySelector('.sub-options');
            // show the selected sub options if available else hide all sub options
            if (subOptions) {
                if (this.checked) {
                    subOptions.style.display = 'block';
                } else {
                    subOptions.style.display = 'none';
                }
            }
        });
    });

    // Destination checkboxes event listener
    destinationTypes.forEach(type => {
        type.addEventListener('change', function() {
            // get all sub options when selected
            const subOptions = this.closest('.destination-option').querySelector('.sub-options');
            // show the selected sub options if available else hide all sub options
            if (subOptions) {
                if (this.checked) {
                    subOptions.style.display = 'block';
                } else {
                    subOptions.style.display = 'none';
                }
            }
        });
    });


    // submit button event listener
    form.addEventListener('submit', function(e) {
        // prevent default form submission
        e.preventDefault();
        const currentSection = document.querySelector('.form-section.active');
        
        if (validateSection(currentSection)) {
            const formData = new FormData(form);

            // create an object to hold the form data
            const formDataObject = {};

            // loop to make the form data to have single key-value pairs
            // and make same key values to be in an array
            formData.forEach((value, key) => {
                // Check if the key already in the object if not add it
                if (!formDataObject[key]) {
                    formDataObject[key] = value;
                }
                // Check if the value is already an array if not make an array 
                else if (Array.isArray(formDataObject[key])) {
                    //if it is an array push the value
                    formDataObject[key].push(value);
                } else {
                    //create array with values
                    formDataObject[key] = [formDataObject[key], value];
                }
            });
          
            // Convert the object to a JSON string
            const jsonString = JSON.stringify(formDataObject);
            console.log('Form Data:', jsonString);


            //POST the form data to the server
            fetch('https://sigma.usq.edu.au/courses/CSC8740/reflect.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: jsonString
            })
            // handle the response
            .then(response => {
                if (!response.ok) {
                    throw new Error("Nework Error");
                }
                return response.json();
            })
            // handle the response data
            .then(data => {
                console.log('Success:', data);
            })
            // handle any errors
            .catch(error => {
                console.error('Error:', error);
            });
            
            // show success message
            form.innerHTML = `
                <div class="success-message">
                    <h2>Thank You!</h2>
                    <p>Your travel preferences have been submitted successfully.</p>
                </div>
            `;
        }
    });

    // helper functions

    // update the progress bar function
    function updateProgressBar(step) {
        progressSteps.forEach(progressStep => {
            const stepNum = parseInt(progressStep.getAttribute('progress-step'));
            if (stepNum === step) {
                //make the current step active
                progressStep.classList.add('active');
            } else if (stepNum < step) {
                // make previous steps completed and remove active class
                progressStep.classList.add('completed');
                progressStep.classList.remove('active');
            } else {
                // for previous navigation remove active and completed class
                progressStep.classList.remove('active', 'completed');
            }
        });
    }

    // validation function for each section
    function validateSection(section) {
        let isValid = true;
        const sectionId = section.id;
        console.log('Validating section:', sectionId);
        const requiredFields = section.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                markInvalid(field);
                isValid = false;
            } else {
                markValid(field);
            }
        });
      
        //check in the section 1: if children or friends are selected and if the count is greater than 0, else mark invalid
        if (sectionId === 'section-1') {
            // check if the partner checkbox is checked and count is invalid
            if (childrenCheckbox.checked && (parseInt(childrenCount.value) <= 0 || childrenCount.value === '')) {
                // mark invalid and trigger error message
                const childrenFields = document.getElementById("children-count")
                markInvalid(childrenFields);
                isValid = false;
            }
            // if the children checkbox is checked and count is valid remove error message
            else if (childrenCheckbox.checked && parseInt(childrenCount.value) > 0) {
                const childrenFields = document.getElementById("children-count")
                markValid(childrenFields);
            }
            // check if the friends checkbox is checked and count is invalid
            if (friendsCheckbox.checked && (parseInt(friendsCount.value) <= 0 || friendsCount.value === '')){
                const friendsFields = document.getElementById("friends-count")
                markInvalid(friendsFields);
                isValid = false;
            }
            // if the friends checkbox is checked and count is valid remove error message
            else if (friendsCheckbox.checked && parseInt(friendsCount.value) > 0) {
                const friendsFields = document.getElementById("friends-count")
                markValid(friendsFields);
            }

            //if activity level is selected as need rest days, make rest friequency field required
            activityLevelTypes.forEach(type => {
                const restFrequency = document.getElementById('rest-frequency');
                if (type.checked && type.value === 'Rest days') {
                    if (!restFrequency.value.trim()) {
                        markInvalid(restFrequency);
                        isValid = false;
                    } else {
                        markValid(restFrequency);
                        console.log('Rest')
                    }
                }
                else if (type.checked && type.value !== 'Rest days') {
                    markValid(restFrequency);
                }
            });   
        }

        //check if accommodation is selected
        if (sectionId === 'section-2') {
            const accommodationSelected = Array.from(accommodationTypes).some(type => type.checked);
            const accommodationFields = document.querySelector('.pref-accom');
            if (!accommodationSelected) {
                markInvalid(accommodationFields);
                isValid = false;
            } else {
                markValid(accommodationFields);
            }
        }

        //check if transport is selected
        if (sectionId === 'section-3') {
            const transportSelected = Array.from(transportTypes).some(type => type.checked);
            const transportFields = document.querySelector('.pref-trans');
            if (!transportSelected) {
                markInvalid(transportFields);
                isValid = false;
            }
            else {
                markValid(transportFields);
            }
        }

        //check if preferred environment is selected
        if (sectionId === 'section-4') {
            const environmentSelected = Array.from(environmentTypes).some(type => type.checked);
            const environmentFields = document.querySelector('.pref-env');
            if (!environmentSelected) {
                markInvalid(environmentFields);
                isValid = false;
            } else {
                markValid(environmentFields);
            }
        }

        //check if destination is selected
        if (sectionId === 'section-5') {
            const destinationSelected = Array.from(destinationTypes).some(type => type.checked);
            const destinationFields = document.querySelector('.pref-dest');
            // check if the destination checkbox is checked
            if (!destinationSelected) {
                markInvalid(destinationFields);
                isValid = false;
            } else {
                markValid(destinationFields);
            }
        }

        
        return isValid;
    }

    // mark invalid and trigger error message
    function markInvalid(field) {
        // add error class to the field
        field.classList.add('error');
        // if there is no error message already, create one
        if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('error-message')) {
            const errorMsg = document.createElement('span');
            // add error message class and text
            errorMsg.classList.add('error-message');
            errorMsg.textContent = 'This field is required';
            field.parentNode.insertBefore(errorMsg, field.nextSibling);
        }
    }

    // remove error message
    function markValid(field) {
        // remove error classes from all
        field.classList.remove('error');
        if (field.nextElementSibling && field.nextElementSibling.classList.contains('error-message')) {
            field.nextElementSibling.remove();
        }
    }

    // handle companion travelers checkboxes function
    function handlePartnerChange() {
        // check if the partner checkbox is checked
        if (partnerCheckbox.checked) {
            // show partner fields
            addPartnerFields();
        } else {
            // hide partner fields
            removePartnerFields();
            // change value of partner checkbox to false value
            partnerCheckbox.checked = false;
        }
    }
    
    // handle children and friends checkboxes function
    function handleChildrenChange() {
        // check if the children checkbox is checked
        if (childrenCheckbox.checked) {
            // make children count to 1 as default
            childrenCount.value = 1;
            // show children count input field
            childrenCountDiv.style.display = 'block';
            // add children fields
            updateChildrenFields();
        } else {
            // hide children count input field
            childrenCountDiv.style.display = 'none';
            removeChildrenFields();
            // set children count to 0
            childrenCount.value = 0;
        }
    }
    
    // handle friends checkbox function
    function handleFriendsChange() {
        if (friendsCheckbox.checked) {
            // make friends count to 1 as default
            friendsCount.value = 1;
            // show friends count input field
            friendsCountDiv.style.display = 'block';
            // add friends fields
            updateFriendsFields();
        } else {
            // hide friends count input field
            friendsCountDiv.style.display = 'none';
            removeFriendsFields();
            // change value of friends checkbox to false
            // set friends count to 0
            friendsCount.value = 0;
        }
    }
    
    // function to create traveler details form dynamically according to companion
    function createTravelerForm(title, prefix) {
        return `
            <div class="form-group">
            <h3>${title} Information</h3>
            <div class="traveler-info">
                <div class="form-row">
                <div class="form-label-input">
                    <label for="${prefix}-name">Name:</label>
                    <input type="text" id="${prefix}-name" name="${prefix}-name" required>
                </div>
                <div class="form-label-input">
                    <label for="${prefix}-birthdate">Birth Date:</label>
                    <input type="date" id="${prefix}-birthdate" name="${prefix}-birthdate" required>
                </div>
                <div class="form-label-input">
                    <label for="${prefix}-occupation">Occupation:</label>
                    <input type="text" id="${prefix}-occupation" name="${prefix}-occupation">
                </div>
                </div>
                <div class="form-row">
                <div class="form-label-input">
                    <label for="${prefix}-gender">Gender:</label>
                    <select id="${prefix}-gender" name="${prefix}-gender" required>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="prefer not to say">Prefer not to say</option>
                    </select>
                </div>
                <div class="form-label-input">
                    <label for="${prefix}-dietary">Dietary Requirements:</label>
                    <select id="${prefix}-dietary" name="${prefix}-dietary" default="none">
                    <option value="none">None</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="halal">Halal</option>
                    <option value="kosher">Kosher</option>
                    <option value="allergies">Allergies</option>
                    <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-label-input">
                    <label for="${prefix}-special-needs">Special Needs:</label>
                    <input type="text" id="${prefix}-special-needs" name="${prefix}-special-needs" placeholder="Enter any special needs">
                </div>
                </div>
            </div>
            </div>
        `;
    }
    
    function addPartnerFields() {
        const partnerHTML = `<div class="form-group" id="partner-info">${createTravelerForm('Partner', 'partner')}</div>`;
        companionTravelersContainer.insertAdjacentHTML('beforeend', partnerHTML);
    }
    
    function removePartnerFields() {
        const partnerInfo = document.getElementById('partner-info');
        if (partnerInfo) partnerInfo.remove();
    }


    // function to create children and friends fields dynamically
    function updateChildrenFields() {
        // reset error message if any
        if (childrenCheckbox.checked && parseInt(childrenCount.value) > 0) {
            const childrenFields = document.getElementById("children-count")
            markValid(childrenFields);
        }
        // remove children header field if number of children is more than 1
        removeChildrenFields();
        // get the number of children from the input field
        const count = parseInt(childrenCount.value) || 0;
        if (count > 0) {
            // Children fields heading
            let childrenHTML = `<div class="form-group" id="children-info"><h3>Children Information</h3>`;
            
            // loop to create children fields using the createTravelerForm function
            for (let i = 1; i <= count; i++) {
                childrenHTML += createTravelerForm(`Child ${i}`, `child-${i}`);
            }
            
            // append the children fields to the companion travelers container
            childrenHTML += `</div>`;
            companionTravelersContainer.insertAdjacentHTML('beforeend', childrenHTML);
        }
    }

    // remove children info heading function
    function removeChildrenFields() {
        const childrenInfo = document.getElementById('children-info');
        if (childrenInfo) childrenInfo.remove();
    }
    
    // function to create friends fields dynamically
    function updateFriendsFields() {
        // reset error message if any
        if (friendsCheckbox.checked && parseInt(friendsCount.value) > 0) {
            const friendsFields = document.getElementById("friends-count")
            markValid(friendsFields);
        }
        // remove friends header field if number of friends is more than 1
        removeFriendsFields();
        // get the number of friends from the input field
        const count = parseInt(friendsCount.value) || 0;
        if (count > 0) {
            // Friends fields heading
            let friendsHTML = `<div class="form-group" id="friends-info"><h3>Friends Information</h3>`;
            
            // loop to create friends fields using the createTravelerForm function
            for (let i = 1; i <= count; i++) {
                friendsHTML += createTravelerForm(`Friend ${i}`, `friend-${i}`);
            }
            
            // append the friends fields to the companion travelers container
            friendsHTML += `</div>`;
            companionTravelersContainer.insertAdjacentHTML('beforeend', friendsHTML);
        }
    }
    
    // remove friends info heading function
    function removeFriendsFields() {
        const friendsInfo = document.getElementById('friends-info');
        if (friendsInfo) friendsInfo.remove();
    }
    
});

// testing form data for every section
document.querySelectorAll('.next-btn, .prev-btn, .submit-btn').forEach(button => {
    button.addEventListener('click', function() {

        
        formData = new FormData(document.getElementById('travel-questionnaire'));

        // list all the keys and values in the formData
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }
    });
});