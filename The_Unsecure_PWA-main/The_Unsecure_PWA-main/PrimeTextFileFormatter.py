





def primeTextFileChanger(read, write):
    textFile = open(read)
    lengthOfNumber = 1
    openCharacter = 1
    allPrimes = ''
    Fileread = False
    
    while openCharacter != '':
        allPrimes += textFile.readline()
        openCharacter = allPrimes[-1]
    
    print(lengthOfNumber)



    while not Fileread:
        pass
        






def main():
    print(primeTextFileChanger("The_Unsecure_PWA-main/Primes/rawPrimes.txt", "The_Unsecure_PWA-main/Primes/rawPrimes.txt"))

main()