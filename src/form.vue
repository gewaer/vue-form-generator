<template>
    <form :data-vv-scope="formName" role="form" @submit.prevent="beforeSubmit">
        <template v-for="(item, index) in formFields">
            <div v-if="Array.isArray(item)" :key="index" class="row">
                <div v-for="x in item" :key="x.label" class="col-12 col-xl-6">
                    <div
                        v-bind="x.wrapperAttributes || {}"
                    >
                        <form-label :item="x" />
                        <form-control ref="control" :item="x" @updateValue="updateValue" />
                    </div>
                </div>
            </div>
            <div
                v-else-if="Object.keys(item) == 'html'"
                :key="index"
                class="field"
                data-test="htmlContentFromFormFields"
                v-html="Object.values(item)[0]"
            />
            <div
                v-else
                :key="index"
                v-bind="item.wrapperAttributes || {}"
            >
                <form-label :item="item" />
                <form-control ref="control" :item="item" @updateValue="updateValue" />
            </div>
        </template>
        <template v-if="$children.length">
            <div :class="formOptions.actionsWrapperClass || {}">
                <input
                    v-if="formOptions.buttons.reset"
                    :class="formOptions.buttons.reset.class || {}"
                    :value="formOptions.buttons.reset.text"
                    type="reset"
                    @click="resetForm"
                >
                <input
                    v-if="formOptions.buttons.cancel"
                    :class="formOptions.buttons.cancel.class || {}"
                    :value="formOptions.buttons.cancel.text"
                    type="button"
                    @click="cancelForm"
                >
                <input
                    :class="formOptions.buttons.submit.class || {}"
                    :disabled="!isFormValid"
                    :value="formOptions.buttons.submit.text"
                    type="submit"
                >
            </div>
            <!-- <p class="is-size-7 fieldRequiredLegend">{{ mandatoryAsteriskLegend }}</p> -->
        </template>
    </form>
</template>

<script>
import { flatten, pickAll, pipe, map } from "ramda";
import { every } from "lodash";

import Label from "./fields/label";
import Control from "./fields/control";

const getLabels = ({ label }) => label;
const valueToProp = (object) => pickAll(object, {});

export default {
    name: "Form",
    components: {
        FormLabel: Label,
        FormControl: Control
    },
    inject: ["$validator"],
    props: {
        emitValuesOnUpdate: {
            type: Boolean,
            default: false
        },
        formFields: {
            type: Array,
            required: true
        },
        formName: {
            type: String,
            required: true
        },
        formOptions: {
            type: Object,
            default() {
                return {
                    buttons: {
                        submit: {
                            text: "Submit"
                        }
                    }
                }
            },
            validator(options) {
                const isValid = every(options.buttons, button => button.text);

                if (!isValid) {
                    // console.error("One or more form options buttons are missing the 'text' property.");
                }

                return isValid;
            }
        },
        hasIcon: {
            type: Boolean,
            default: true
        },
        mandatoryAsteriskLegend: {
            type: String,
            default: "* field required"
        },
        resetFormAfterSubmit: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            formValues: undefined,
            allControls: []
        }
    },
    computed: {
        isFormValid() {
            const allControlRequired = this.allControls.filter(({ item }) => item.validations && item.validations.required);
            const isAllControlRequiredWithValue = allControlRequired.every(({ value }) => !!value);
            const isFormValuesEmpty = Object.values(this.formValues).every(x => x === undefined);
            const hasError = !!this.$validator.errors.items.length;
            return isAllControlRequiredWithValue && !isFormValuesEmpty && !hasError;
        }
    },
    created() {
        this.formValues = pipe(flatten, map(getLabels), valueToProp)(this.formFields);

        // This is very taxing. Use at your own risk.
        if (this.emitValuesOnUpdate) {
            this.$watch("formValues", (values) => {
                this.$emit("formValuesUpdated", values);
            }, { deep: true });
        }
    },
    mounted() {
        this.allControls = this.$refs.control || [];
    },
    // Seems the mounted hook is not working. Using updated meanwhile.
    updated() {
        if (!this.allControls.length) {
            this.allControls = this.$refs.control || [];
        }
    },
    methods: {
        async beforeSubmit(event) {
            let isValidated = false
            await this.$validator.validateAll(this.formName)
                .then(result => {
                    isValidated = result
                });

            isValidated && this.isFormValid && this.emitValues({
                formName: this.formName,
                values: this.formValues
            })
            isValidated && this.resetFormAfterSubmit && this.resetForm(event)
        },
        cancelForm() {
            this.$emit("formCancelled");
        },
        clearValues() {
            this.allControls.map(x => {
                x.value = "";
            });

            const subValues = this.allControls.filter(x => x.$children[0].value)
            subValues.map(x => {
                x.$children[0].value = [];
            });
        },
        clearPrefillValues() {
            const inputsPrefilled = this.allControls.filter(x => x.item.value)
            inputsPrefilled.map(x => {
                x.item.value = undefined;
            });

            const selects = this.allControls.filter(x => x.item.options)
            selects.map(select => {
                select.item.options.map(option => {
                    option.selected && (option.selected = false);
                })
            })
        },
        emitValues(data) {
            this.$emit("formSubmitted", data);
        },
        resetFormValues() {
            this.clearValues();
            this.clearPrefillValues();
        },
        resetForm(event) {
            this.resetFormValues();
            this.errors.clear(this.formName);

            try {
                event.target.reset();
            } catch (err) {
                event && event.target.reset;
            }

            this.$validator.reset();
        },
        updateValue(field, value) {
            this.$set(this.formValues, field, value);
        }
    }
}
</script>
