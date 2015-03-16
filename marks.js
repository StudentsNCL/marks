

var rowTemplate = $('tr.module').clone();

rowTemplate.find('input').removeAttr('placeholder');

rowTemplate.find('.deleteRow').show();

$(document).on('click', '#addRow button', function() {
        
    $('#addRow').before(rowTemplate.clone());
    $('.moduleName:last').focus();

    return false;

});

$(document).on('click', '.deleteRow', function(e) {
    $(this).closest('tr').remove();
});

function extractData() {

    return $('#modules tr.module').get().map(function(row) {

        return {
            name: $(row).find('.moduleName').val(),
            credits: Number($(row).find('.creditsWorth').val()),
            result: Number($(row).find('.result').val()),
            percentage: Number($(row).find('.pcOfDegree').val()),
            el: row
        };

    });
}

function setIfNotEmpty($el, val) {

    if($el.val() != '')
        $el.val(val);
}


function updateTable(modules) {

    modules.forEach(function(module) {

        setIfNotEmpty($(module.el).find('.moduleName'), module.name.trim());
        setIfNotEmpty($(module.el).find('.creditsWorth'), module.credits.toFixed(2));
        setIfNotEmpty($(module.el).find('.result'), module.result.toFixed(2));
        $(module.el).find('.pcOfDegree').val(module.percentage.toFixed(2));
    });


    $('#overall').text(modules.reduce(function(accum, module) {
        return accum + module.percentage;
    }, 0));


    var totalCreditsRequired = Number($('#totalCredits').val());

    var totalCreditsSupplied = modules.reduce(function(accum, module) {
        return accum + module.credits;
    }, 0);

    if(totalCreditsRequired == totalCreditsSupplied) {

        $('#warning').text('');

    } else if(totalCreditsRequired > totalCreditsSupplied) {

        $('#warning').text('Not enough credits; add more modules');
 
    } else if(totalCreditsRequired < totalCreditsSupplied) {

        $('#warning').text('Too many credits supplied');

    }
}

function updateResults() {

    var totalCredits = Number($('#totalCredits').val());

    updateTable(extractData().map(function(module) {
           
        return $.extend(module, {
            percentage: (module.credits / totalCredits) * module.result
        });

    }));

};

$(document).on('ready change click', updateResults);



