define(
    ['jquery',
     'lodash',
     'backbone',
     'i18n!nls/content',
     'i18n!nls/ui-strings'
    ], function ($, _, Backbone, content, uiStrings) {
    var BasicInfoView = Backbone.View.extend({

        tagName: 'div',
        id: 'basic-info-view',
        className: 'app-view',

        order: 1,

        template: _.template($('#app-view-template').html()),
        formViewTemplate: _.template($('#basic-info-form-view-template').html()),

        events: {
            'focus #basic-info-address': 'clearValidClass',
            'blur #basic-info-address': 'addressUpdate',
            'change #basic-info-grade': 'gradeUpdate'
        },

        initialize: function () {
            var model = this.model;
            this.$el.html(this.template({
                view: 'basicInfo',
                content: content
            }));
            this.$formView = $('<div id="basic-info-form-view"></div>')
                .appendTo(this.$el);

            this.listenTo(this.model, 'addressGIS:valid', function () {
                $('#basic-info-address').addClass('valid');
            });

            this.listenTo(this.model, 'addressGIS:invalid', function () {
                $('#basic-info-address').addClass('invalid');
            });

            this.listenTo(this.model, 'change:address', function () {
                $('#basic-info-address').val(model.get('address'));
            });
        },

        render: function () {
            var address = this.model.get('address'),
                addressGISValid = this.model.get('addressGISValid'),
                grade = this.model.get('grade'),
                grades = ['PS', 'PK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

            this.$formView.html(this.formViewTemplate({
                address: address,
                addressGISValid: addressGISValid,
                selectedGrade: grade,
                grades: grades,
                uiStrings: uiStrings
            }));
        },

        clearValidClass: function (e) {
            $(e.target).removeClass();
        },

        addressUpdate: function (e) {
            var address = e.target.value;
            this.model.set({'address': address});
        },

        gradeUpdate: function (e) {
            var grade = $(e.target).children(':selected').attr('value');
            this.model.set({'grade': grade});
        },

        close: function () {
            this.remove();
            this.unbind();
        }

    });
    return BasicInfoView;
});