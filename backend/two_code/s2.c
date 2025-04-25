// s2.c
#include <stdio.h>

int add_numbers(int a, int b) {
    return a + b;
}

int main() {
    int x, y, result;
    printf("Enter first number: ");
    scanf("%d", &x);
    printf("Enter second number: ");
    scanf("%d", &y);

    result = add_numbers(x, y);
    printf("Sum: %d\n", result);

    return 0;
}
