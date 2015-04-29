/** Array of courses populated from courses.json */
var courses = [];

/** Number of credits available */
var totalCredits = 240;

/** Current total percentage gained */
var totalPercentage = 40;

/** The course as stringified json from local storage */
var localCourse = localStorage.getItem('course');

/** Clone of a module row */
var $rowTemplate = $('tr.module').clone();

/** Module table's tbody */
var $tbody = $('#modules tbody');

/** Total credits input */
var $totalCredits = $('#totalCredits');

/** Course select dropdown */
var $course = $('#course');

/** Add row button */
var $addRow = $('#addRow');

/** Span of the overall percentage */
var $overall= $('#overall');

/** Warning alert */
var $warning = $('#warning');

// Get courses.json which countains a courses array
$.getJSON('courses.json', function(coursesArray) {
    // Set courses to the courses array we now have
    courses = coursesArray;
});

// If there is a course in localstorage, load it into the table
if (localCourse) {
    var data = JSON.parse(localCourse);
    $course.find('option[value=' + data.id + ']').prop('selected', true);
    loadFromObject(data);
}

// When .addRow is clicked, append a row to the table
$addRow.on('click', function() {
    var $toAppend = $rowTemplate.clone();
    $tbody.append($toAppend);
    $toAppend.focus();
});

// When a .deleteRow is clicked, remove the corresponding row
$(document).on('click', '.deleteRow', function(e) {
    $(this).closest('tr').remove();
    updateResults();
});

// When an input is changed, fire updateResults(false) with a 200ms buffer
$(document).on('keyup change', 'input', debounce(updateResults.bind(this, false), 200));

// When course selector is changed, refresh table
$course.change(function() {
    var id = $(this).val();
    loadFromObject(courses[id - 1]);
});

// Allow the table to be re-ordered
$("#modules").find('tbody').sortable({
    items: "tr",
    cursor: 'move',
    opacity: 0.6,
    update: function() {
        saveData();
    }
});


/**
 * Takes a course object and loads it into the view, adding rows for each module
 * @param  {Object} data The course objtect
 */
function loadFromObject(data) {
    // Delete all modules
    $('.module').remove();

    // Set total credits
    $totalCredits.val(data.credits);

    // An array of jQuery objects to append
    var toAppend = [];

    // For each module, create a row to add to the table
    $.each(data.modules, function(key, module) {
        var $row = $rowTemplate.clone();
        $row.find('.moduleName').val(module.name);
        $row.find('.creditsWorth').val(module.credits);
        $row.find('.result').val(module.mark || 40);
        toAppend.push($row);
    });

    // Append rows to table
    $tbody.append(toAppend);

    // Update the table
    updateResults(true);
}

/**
 * Update the percentage of all modules
 * @param {Boolean} allFields If set, all fields will be updated (not just overall percentage)
 */
function updateResults(allFields) {
    totalCredits = Number($totalCredits.val());
    // Get all courses, and update the percentage of each one
    var updatedCourses = extractData().map(function(module) {
        return $.extend(module, {
            percentage: (module.credits / totalCredits) * module.result
        });
    });

    // Update the tables with this new array
    updateTable(updatedCourses, allFields);

    // Persist to local storage
    saveData();
}

/**
 * Pull out all of the inputted data in the table
 * @return {Array} An array of course objects
 */
function extractData() {
    return $('tr.module').get().map(function(row) {
        return {
            name: $(row).find('.moduleName').val(),
            credits: Number($(row).find('.creditsWorth').val()),
            result: Number($(row).find('.result').val()),
            percentage: Number($(row).find('.pcOfDegree').val()),
            el: row
        };
    });
}

/**
 * Set all the values in the table
 * @param {Array}   modules     Array of module objects
 * @param {Boolean} allFields   If set, all fields will be updated (not just overall percentage)
 */
function updateTable(modules, allFields) {
    // For each module, set up the corresponding row's values
    modules.forEach(function(module) {
        if (allFields) {
            $(module.el).find('.moduleName').val(module.name.trim());
            $(module.el).find('.creditsWorth').val(module.credits);
            $(module.el).find('.result').val(module.result);
        }
        $(module.el).find('.pcOfDegree').val(module.percentage.toFixed(2));
    });

    // Calculate the total mark
    var mark = modules.reduce(function(accum, module) {
        return accum + module.percentage;
    }, 0);

    // Confetti time!
    totalPercentage = mark;
    if (window.changeConfetti) {
        changeConfetti();
    }

    // Set overall value and progress bar width
    $overall.text(mark.toFixed(2)).parent().width(mark + '%');

    // Calculate the total number of credits inputted
    var totalCreditsSupplied = modules.reduce(function(accum, module) {
        return accum + module.credits;
    }, 0);

    if (totalCredits === totalCreditsSupplied) {
        // All good, hide warning
        $warning.hide();
    } else if(totalCredits > totalCreditsSupplied) {
        // Too few credits
        $warning.text('Not enough credits; add more modules').show();
    } else if(totalCredits < totalCreditsSupplied) {
        // Too many credits
        $warning.text('Too many credits supplied').show();
    }
}

/**
 * Persists the inputted course data to local storage
 */
function saveData() {
    // Get currently selected course
    var $selectedCourse = $course.find('option:selected');

    // Build course object
    var course = {
        id: $selectedCourse.val(),
        name: $selectedCourse.text(),
        credits: totalCredits,
        modules: [],
    };

    // Add modules to course object
    $tbody.find('.module').each(function(index, module) {
        module = $(module);
        course.modules.push({
            name: module.find('.moduleName').val(),
            credits: module.find('.creditsWorth').val(),
            mark: module.find('.result').val(),
        });
    });

    // Save course object
    localStorage.setItem('course', JSON.stringify(course));
}

/**
 * Debounce a function, from Underscore.
 * @param  {function} func      The function to be called
 * @param  {int} wait           The function will be called after it stops being called for N milliseconds
 * @param  {bool} immediate     If `immediate` is passed, trigger the function on the leading edge, instead of the trailing.
 * @return {function}           a function, that, as long as it continues to be invoked, will not be triggered
 */
function debounce(func, wait, immediate) {
    var timeout, result;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) result = func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(context, args);
        return result;
    };
}
