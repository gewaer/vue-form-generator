<template>
    <label
        v-if="item.showLabel !== false"
        :for="item.label | slugify"
    >
        {{ item.label }}
        <span v-if="item.help" class="help">{{ item.help }}</span>
    </label>
</template>

<script>
import { slugify } from "../helpers";

export default {
    name: "Label",
    filters: {
        slugify
    },
    props: {
        item: {
            type: Object,
            required: true
        }
    }
}
</script>
