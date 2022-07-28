import userDevice from "@/classes/userDevice";
import { Category, CategoryForm } from "@/types/category";
import { computed } from "@vue/reactivity";
import { PropType, defineEmits, getCurrentInstance, ref, reactive } from "vue";
import cartes from "@/classes/cartes";

const categories = ref<Category[]>([]);

// reactive category
const category = reactive<Category>({
    id: 0,
    name: "",
    icon: "",
});
// reactive categories
// const categories = reactive<Category[]>([]);


export function useCategory() {

    const minCategoryNameLength = 3;

    const emit = getCurrentInstance()?.emit as any;

    const isLoading = ref(false);

    const formErrors = reactive<CategoryForm>({
        title: null,
        slug: null,
        description: null,
        privacy: null,
        users_can_create_markers: null,
    });

    const getAllCategories = async () => {
        if (!userDevice.online) {
            return alert("You must be online to get all categories.");
        }

        const data = await cartes.categories().get();
        categories.value = data.data;
    }

    const getCategory = async (categoryId: string | number) => {
        if (!userDevice.online) {
            return alert("You must be online to get a category.");
        }
        const data = await cartes.categories(categoryId).get();
        Object.assign(category, data);
    }

    const hasErrors = computed(() => {
        return Object.values(formErrors).some((error) => error !== "");
    });

    const validateCategoryForm = (form: CategoryForm) => {
        if (form.title && form.title.length < minCategoryNameLength) {
            formErrors.title = "Enter a valid title";
        }
        return !hasErrors.value;
    };

    const addCategory = async (formData = null as CategoryForm | null, redirect = false) => {
        if (formData && !validateCategoryForm(formData)) {
            return;
        };
        if (!userDevice.online) {
            return alert("You must be online to add a category.");
        }
        isLoading.value = true;
        const data = await cartes.categories().create(formData);
        console.log("New category: ", data);
        localStorage["category_" + data.id] = data.token;
        if (redirect) {
            window.location.href = "?categoryId=" + data.id;
        }
        emit("addedCategory", data);
        isLoading.value = false;
    };

    const canDeleteCategory = (category: Category) => {
        return category.token || localStorage.getItem("category_" + category.id);
    };

    const canUpdateCategory = (category: Category) => {
        return canDeleteCategory(category);
    }

    const canCreateMarkers = (category: Category) => {
        return category.users_can_create_markers === 'yes' || category.token || localStorage.getItem("category_" + category.id);
    }

    const deleteCategory = async (category: Category) => {
        if (!userDevice.online) {
            return alert("You must be online to delete a category.");
        }
        // Check that the category exists and that it has a token field
        if (canDeleteCategory(category)) {
            await cartes.categories(category.id).delete();
            localStorage.removeItem("category_" + category.id);
            alert("Category deleted.");
            window.location.href = "/";
            emit('deletedCategory', category);
        } else {
            alert("This category could not be deleted.");
        }
    };

    return {
        canDeleteCategory,
        canUpdateCategory,
        deleteCategory,
        addCategory,
        validateCategoryForm,
        getCategory,
        getAllCategories,
        canCreateMarkers,
        isLoading,
        formErrors,
        hasErrors,
        minCategoryNameLength,
        category,
        categories,
    };
}