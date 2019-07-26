<template>
    <div :class="{ 'has-icons-left': item.iconLeft, 'has-icons-right': shouldShowErrorIcon }" class="control">
        <component
            v-validate.immediate="getValidation"
            v-if="item.value"
            v-model.lazy.trim="value"
            :data-vv-name="item.label"
            :error="fieldError"
            :is="`app-${getComponent}`"
            :item="item"
        />
        <component
            v-validate="getValidation"
            v-else
            v-model.lazy.trim="value"
            :data-vv-name="item.label"
            :error="fieldError"
            :is="`app-${getComponent}`"
            :item="item"
        />
        <span v-if="item.iconLeft" class="icon is-small is-left">
            <i :class="`fa fa-${item.iconLeft}`" />
        </span>
        <span v-if="shouldShowErrorIcon" class="icon is-small is-right">
            <i class="fa fa-exclamation-triangle" />
        </span>
        <span v-if="fieldError" :class="item.errorClass || 'text-danger'">
            {{ fieldError.msg }}
        </span>
    </div>
</template>

<script>
import Input from "./input";
import Select from "./select";
import Textarea from "./textarea";
import Checkbox from "./checkbox";
import Radio from "./radio";

const NOT_NORMAL_INPUT = ["textarea", "select", "checkbox", "radio"];

export default {
    name: "Control",
    components: {
        AppInput: Input,
        AppSelect: Select,
        AppTextarea: Textarea,
        AppCheckbox: Checkbox,
        AppRadio: Radio
    },
    props: {
        item: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            DEFAULT_MAX_LENGTH_INPUT: 255,
            DEFAULT_MAX_LENGTH_TEXTAREA: 32000,
            value: undefined
        }
    },
    computed: {
        hasIcon() {
            return this.$parent.hasIcon;
        },
        shouldShowErrorIcon() {
            return this.fieldError && this.item.type !== "select" && this.hasIcon;
        },
        fieldError() {
            return this.errors.items.find(
                ({ field }) => field === this.item.label
            );
        },
        isRequired() {
            return this.item.isRequired !== false;
        },
        isNormalInput() {
            return !NOT_NORMAL_INPUT.includes(this.item.type);
        },
        getComponent() {
            return this.isNormalInput ? "input" : this.item.type;
        },
        getValidation() {
            const { type } = this.item;
            const { min, max, min_value: minValue, max_value: maxValue } = this.item.validations || {};
            const isNormalInputOrTextarea = this.isNormalInput || type === "textarea";
            const isInputNumber = type === "number";

            return isNormalInputOrTextarea && {
                min: !isInputNumber && min || false,
                max: !isInputNumber && max || type === "textarea" ? this.DEFAULT_MAX_LENGTH_TEXTAREA : this.DEFAULT_MAX_LENGTH_INPUT,
                min_value: isInputNumber && minValue || false,
                max_value: isInputNumber && maxValue || false,
                ...(this.item.validations || {})
            }
        }
    },
    watch: {
        value(val) {
            // this.$parent.formValues[this.item.field || this.item.label] = val;)
            this.$emit("updateValue", this.item.field || this.item.label, val);
        }
    }
}
</script>
