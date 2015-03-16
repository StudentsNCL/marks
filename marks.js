
var rowTemplate = $('tr.exampleRow').clone().addClass('module');

rowTemplate.find('input:not(.pcOfDegree)').prop('disabled', false).removeAttr('placeholder');

$(document).on('click', '#addRow button', function() {
        
    $('#addRow').before(rowTemplate.clone());
    $('.moduleName:last').focus();

    return false;

});

function extractData() {

    return $('#modules tr.module').get().map(function(row) {

        return {
            name: $(row).find('.moduleName').val(),
            credits: $(row).find('.creditsWorth').val(),
            result: $(row).find('.result').val(),
            percentage: $(row).find('.pcOfDegree').val(),
            el: row
        };

    }).filter(function(module) {

        return module.result != '';

    });
}

function updateTable(modules) {

    console.log(modules);

    modules.forEach(function(module) {

        $(module.el).find('.moduleName').val(module.name);
        $(module.el).find('.creditsWorth').val(module.credits);
        $(module.el).find('.result').val(module.result);
        $(module.el).find('.pcOfDegree').val(module.percentage);
    });


    $('#overall').text(modules.reduce(function(accum, module) {

        return accum + module.percentage;

    }, 0));


}

function updateResults() {

    var totalCredits = parseFloat($('#totalCredits').val());

    updateTable(extractData().map(function(module) {
           
        return $.extend(module, {

            percentage: (module.credits / totalCredits) * module.result

        });

    }));

};

$(document).on('click', updateResults);


