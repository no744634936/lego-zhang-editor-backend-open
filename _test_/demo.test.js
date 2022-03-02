/**
 * @description test demo
 * @author zhang
 */

function sum(a, b) {
    return a + b
}

test('10 plus 20 should be 30', () => {
    const result = sum(10, 20)
    expect(result).toBe(30)
})

test('10 plus 20 should not be 40', () => {
    const result = sum(10, 20)
    expect(result).not.toBe(40)
})
